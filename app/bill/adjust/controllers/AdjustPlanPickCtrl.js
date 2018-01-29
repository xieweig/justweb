'use strict';

angular.module('app').controller('AdjustPlanPickCtrl', function ($scope, $uibModal, Common, params, ApiService, $timeout) {
    $scope.bill = params.bill;
    $scope.pickType = 'material';

    $timeout(function () {
        if (params.bill.outStationCode) {
            var stationType = _.find($scope.station, function (item) {
                return item.value === params.bill.outStationCode;
            }).siteType;

            if (stationType === 'LOGISTICS') {
                $scope.bill.outStorageCode = 'STORAGE';
                $('#outStorageCode').val('STORAGE').trigger('change');
            } else {
                $scope.bill.outStorageCode = 'NORMAL';
                $('#outStorageCode').val('NORMAL').trigger('change');
            }
        }
        $('#tabHead').on('click', 'a', function () {
            $scope.pickType = $(this).attr('data-type');
        });
    });
    // 库位切换提示
    $scope.$watch('bill.outStorage', function (newVal, oldVal) {
        if (oldVal && newVal !== oldVal && newVal !== $scope.bill.outStorageCode) {
            swal({
                title: '是否将出库库位修改为' + getTextByVal($scope.outType, newVal),
                type: 'warning',
                confirmButtonText: '是的',
                showCancelButton: true
            }).then(function (res) {
                if (res.value) {
                    $scope.bill.outStorageCode = newVal;
                } else if (res.dismiss === 'cancel') {
                    // 重置选项为初始
                    $('#outStorageCode').val(oldVal).trigger('change');
                }
            });
        }
    });

    // 货物grid
    $scope.cargoGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            dataSource: [],
            columns: [
                {field: "cargoName", title: "货物名称", width: 120},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {
                    field: "measurementCode", title: "规格", width: 120,
                    template: function (data) {
                        return data.number + getTextByVal(params.cargoUnit, data.measurementCode);
                    }
                },
                {field: "shippedAmount", title: "应拣数量", width: 120},
                {field: "actualAmount", title: "实拣数量", width: 120}
            ]
        }
    };
    $scope.cargoArray = [];
    (function () {
        // 根据货物拣货也可以有调剂  所以只需要判断货物
        $scope.basicEnum = params.bill.basicEnum;
        if (params.bill.basicEnum === 'BY_CARGO') {
            var cargoCodes = [];
            _.each(params.bill.childPlanBillDetails, function (item) {
                cargoCodes.push(item.rawMaterial.cargo.cargoCode);
            });
            Common.getCargoByCodes(cargoCodes).then(function (cargoList) {
                $scope.cargoBarCodes = [];
                var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                    $scope.cargoBarCodes.push(item.barCode);
                    return item.cargoCode
                }), cargoList);
                _.each(params.bill.childPlanBillDetails, function (item) {
                    var cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                    $scope.cargoArray.push({
                        cargoName: cargo.cargoName,
                        cargoCode: cargo.cargoCode,
                        rawMaterialCode: cargo.rawMaterialCode,
                        rawMaterialName: cargo.rawMaterialName,
                        rawMaterialTypeName: cargo.rawMaterialTypeName,
                        measurementCode: cargo.measurementCode,
                        number: cargo.number,
                        shippedAmount: item.amount,
                        actualAmount: 0
                    });
                });
                $timeout(function () {
                    $scope.cargoGrid.kendoGrid.dataSource.data($scope.cargoArray);
                });
            });
        }

        // 初始化原料
        $scope.materialList = [];
        _.each($scope.bill.childPlanBillDetails, function (item) {
            $scope.materialList.push({
                material: {
                    amount: item.amount,
                    actualAmount: 0,
                    materialName: item.rawMaterial.rawMaterialName,
                    materialCode: item.rawMaterial.rawMaterialCode
                },
                kendoGrid: {
                    kendoSetting: {
                        editable: true,
                        columns: [
                            {title: "操作", width: 85, command: [{name: 'del', text: "删除", click: delCargo}]},
                            {field: "cargoName", title: "货物名称", width: 120},
                            {field: "cargoCode", title: "货物编码", width: 120},
                            {field: "rawMaterialName", title: "所属原料", width: 120},
                            {
                                title: "规格", width: 120,
                                template: function (data) {
                                    return data.number + getTextByVal(params.cargoUnit, data.measurementCode);
                                }
                            },
                            {field: "actualAmount", title: "实拣数量", width: 120, kType: 'number', editable: true}
                        ],
                        save: function (e) {
                            $timeout(function () {
                                calculateActual();
                            });
                        }
                    }
                }
            });
        });
    }());
    function calculateActual() {
        _.each($scope.materialList, function (material) {
            material.material.actualAmount = 0;
            _.each(material.kendoGrid.kendoGrid.dataSource.data(), function (item) {
                var actualAmount = parseInt(item.actualAmount);
                if (!actualAmount || actualAmount !== actualAmount) {
                    actualAmount = 0;
                }
                var number = parseInt(item.number);
                if (!number || number !== number) {
                    number = 0;
                }
                material.material.actualAmount += number * actualAmount;
            });
        });
    }

    // 原料选择货物
    $scope.chooseCargo = function (item) {
        Common.getMaterialByCodes([item.material.materialCode]).then(function (materialList) {
            var material = {};
            if (materialList && materialList.length > 0) {
                material = materialList[0];
            }
            material.amount = item.material.amount;
            $uibModal.open({
                templateUrl: 'app/bill/adjust/modals/addCargoModal.html',
                size: 'lg',
                controller: 'AdjustAddCargoCtrl',
                resolve: {
                    params: {
                        cargoUnit: params.cargoUnit,
                        materialUnit: params.materialUnit,
                        material: material,
                        data: combinationItem(item.kendoGrid.kendoGrid.dataSource.data()),
                        cb: function (data) {
                            var dataSource = combinationItem(data);
                            item.kendoGrid.kendoGrid.dataSource.data(dataSource);
                            calculateActual();
                        }
                    }
                }
            });
        });
    };

    function combinationItem(dataSource) {
        return _.map(dataSource, function (item) {
            return {
                cargoName: item.cargoName,
                cargoCode: item.cargoCode,
                rawMaterialName: item.rawMaterialName,
                rawMaterialCode: item.rawMaterialCode,
                measurementCode: item.measurementCode,
                standardUnitCode: item.standardUnitCode,
                number: item.number,
                actualAmount: item.actualAmount
            };
        });
    }

    // 删除原料表格中的货物
    function delCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        swal({
            title: '提示',
            text: '确定要删除' + dataItem.cargoName + '?',
            type: 'warning',
            showCancelButton: true
        }).then(function (res) {
            if (res.value) {
                dataItem.parent().remove(dataItem)
            }
        });
    }

    // 扫码货物
    $scope.enterCargo = function (e) {
        var keyCode = window.event.keyCode;
        if (keyCode === 13) {
            if (!$scope.cargoBarcode) {
                swal('请输入货物条码', '', 'warning');
                return;
            }
            if (_.indexOf($scope.cargoBarCodes, $scope.cargoBarcode) < 0) {
                swal('货物条码必须存在于明细列表', '', 'warning');
                return;
            }
            Common.getCargoByBarCode($scope.cargoBarcode).then(function (cargo) {
                if (!cargo) {
                    swal('货物不存在', '', 'warning');
                    return;
                }
                $scope.cargoByBarcode = cargo;
                $scope.cargoByBarcode.standardUnitName = getTextByVal(params.materialUnit, cargo.standardUnitCode);
                $scope.cargoByBarcode.range = 'add';
                $uibModal.open({
                    templateUrl: 'app/bill/adjust/modals/planPickCargo.html',
                    size: 'md',
                    scope: $scope
                }).closed.then(function () {
                    $scope.cargoByBarcode = null;
                    $scope.cargoBarcode = '';
                });
            });
        }
    };

    // 获取货物加减的范围
    $scope.getCargoRange = function () {
        var dataItem = _.find($scope.cargoArray, function (item) {
            return item.cargoCode === $scope.cargoByBarcode.cargoCode;
        });
        var number = 0;
        var actualAmount = parseInt(dataItem.actualAmount);
        if ($scope.cargoByBarcode.range === 'add') {
            number = parseInt($scope.cargoByBarcode.addNumber);
        } else {
            number = 0 - parseInt($scope.cargoByBarcode.lessNumber);
        }
        if (number) {
            dataItem.actualAmount = actualAmount + number;
        }
        $scope.cargoGrid.kendoGrid.dataSource.data($scope.cargoArray);

    };

    // 保存拣货
    $scope.savePick = function () {
        var bill = getParams('save');
        if (bill) {
            ApiService.post('/api/bill/adjust/save', bill).then(function (response) {
                if (response.code !== '000') {
                    swal('', response.message, 'error');
                } else {
                    swal('操作成功!', '', 'success').then(function () {
                        $scope.$close();
                    });
                }
            }, apiServiceError);
        }
    };

    // 提交拣货
    $scope.submitPick = function () {
        var bill = getParams('submit');
        if (bill) {
            ApiService.post('/api/bill/adjust/submit', bill).then(function (response) {
                if (response.code !== '000') {
                    swal('', response.message, 'error');
                } else {
                    swal('操作成功!', '', 'success').then(function () {
                        $scope.$close();
                    });
                }
            }, apiServiceError);
        }
    };

    function getParams(type) {
        var result = {
            sourceCode: params.bill.billCode,
            billPurpose: 'OUT_STORAGE',
            specificBillType: 'ADJUST',
            sourceBillType: params.bill.sourceBillType,
            billType: params.bill.billType,
            inLocation: {
                stationCode: params.bill.inStationCode,
                stationName: params.bill.inStationName
                // stationType: params.bill.inStationType,
                // storage: {
                //     storageCode: params.bill.inStationCode,
                //     storageName: params.bill.inStationCode
                // }
            },
            outLocation: {
                stationCode: params.bill.outStationCode,
                stationName: params.bill.outStationCode
                // stationType: params.bill.inStationCode,
                // storage: {
                //     storageCode: params.bill.inStationCode,
                //     storageName: params.bill.inStationCode
                // }
            },
            billDetails: []
        };
        var emptyItem = null;
        if ($scope.pickType === 'cargo') {
            result.basicEnum = 'BY_CARGO';
            emptyItem = _.find($scope.cargoArray, function (dataItem) {
                result.billDetails.push({
                    actualAmount: dataItem.actualAmount,
                    shippedAmount: dataItem.shippedAmount,
                    belongMaterialCode: dataItem.rawMaterialCode,
                    rawMaterial: {
                        cargo: {
                            cargoCode: dataItem.cargoCode,
                            cargoName: dataItem.cargoName
                        },
                        rawMaterialCode: dataItem.rawMaterialCode,
                        rawMaterialName: dataItem.rawMaterialName
                    }
                });
                return false;
            });
        } else {
            // 如果要提示 未选择拣货计划   取消下面的注释即可
            result.basicEnum = 'BY_MATERIAL';
            emptyItem = _.find($scope.materialList, function (material) {
                var dataSource = material.kendoGrid.kendoGrid.dataSource.data();
                if (type === 'submit' && dataSource.length === 0) {
                    swal('请选择' + material.material.materialName + '的货物', '', 'error');
                    return true;
                }
                var emptyCargo = _.find(dataSource, function (dataItem) {
                    if (type === 'submit' && !dataItem.actualAmount && dataItem.actualAmount !== 0) {
                        swal('请选择' + material.material.materialName + '中' + dataItem.cargoName + '的实拣数量', '', 'error');
                        return true;
                    }
                    result.billDetails.push({
                        actualAmount: dataItem.actualAmount,
                        shippedAmount: material.material.amount,
                        belongMaterialCode: dataItem.rawMaterialCode,
                        rawMaterial: {
                            cargo: {
                                cargoCode: dataItem.cargoCode,
                                cargoName: dataItem.cargoName
                            },
                            rawMaterialCode: dataItem.rawMaterialCode,
                            rawMaterialName: dataItem.rawMaterialName
                        }
                    });
                    return false;
                });
                if (!emptyCargo) {
                    return false;
                }
                return true;
            });
        }
        if (!emptyItem) {
            return result;
        }
        return false;
    }
});