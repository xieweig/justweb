'use strict';

angular.module('app').controller('AdjustPlanPickCtrl', function ($scope, $uibModal, Common, params, ApiService, $timeout) {
    $scope.bill = params.bill;

    $timeout(function () {
        if ($.cookie('currentStationType') === 'LOGISTICS') {
            $('#outStorageCode').val('STORAGE').trigger('change');
        } else {
            $('#outStorageCode').val('NORMAL').trigger('change');
        }
    });
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
                            var dataSource = item.kendoGrid.kendoGrid.dataSource;
                            dataSource.data(combinationItem(data));
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


    // 货物grid
    $scope.cargoGrid = {
        kendoSetting: {
            dataSource: [{xxxxx: 123, a: 123, b: 44}, {xxxxx: 123, a: 123, b: 44}],
            columns: [
                {field: "xxxxx", title: "货物名称", width: 120},
                {field: "xxxxx", title: "货物编码", width: 120},
                {field: "xxxxx", title: "所属原料", width: 120},
                {field: "xxxxx", title: "规格", width: 120},
                {field: "xxxxx", title: "应拣数量", width: 120},
                {field: "b", title: "实拣数量", width: 120}
            ]
        }
    };

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
            $uibModal.open({
                templateUrl: 'app/bill/adjust/modals/planPickCargo.html',
                size: 'md',
                scope: $scope
            });
        }
    };

    // 保存拣货
    $scope.savePick = function () {
        var bill = getParams('save');
        ApiService.post('/api/bill/adjust/save', bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功!', '', 'success').then(function () {
                    $scope.$close();
                });
            }
        }, apiServiceError);
    };

    // 提交拣货
    $scope.submitPick = function () {
        var bill = getParams('submit');
        ApiService.post('/api/bill/adjust/submit', bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功!', '', 'success').then(function () {
                    $scope.$close();
                });
            }
        }, apiServiceError);
    };

    function getParams() {
        var result = {
            sourceCode: params.bill.billCode,
            basicEnum: 'BY_MATERIAL',
            billPurpose: 'OUT_STORAGE',
            self: false,
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
                stationCode: params.bill.inStationCode,
                stationName: params.bill.inStationCode
                // stationType: params.bill.inStationCode,
                // storage: {
                //     storageCode: params.bill.inStationCode,
                //     storageName: params.bill.inStationCode
                // }
            },
            billDetails: [
                {
                    "actualAmount": 0,
                    "rawMaterial": {
                        "cargo": {
                            "cargoCode": "cargoCode2",
                            "cargoName": "string"
                        },
                        "rawMaterialCode": "string",
                        "rawMaterialName": "string"
                    },
                    "shippedAmount": 100,
                    "belongMaterialCode": "NN"
                }
            ]
        };
        result.billDetails = [];
        var emptyItem = _.find($scope.materialList, function (material) {
            var dataSource = material.kendoGrid.kendoGrid.dataSource.data();
            if (dataSource.length === 0) {
                swal('请选择' + material.materialName + '的货物', '', 'error');
                return true;
            }
            var emptyCargo = _.find(dataSource, function (dataItem) {
                if (!dataItem.actualAmount && dataItem.actualAmount !== 0) {
                    swal('请选择' + material.materialName + '中' + dataItem.cargoName + '的实拣数量', '', 'error');
                    return true;
                }
                result.billDetails.push({
                    actualAmount: dataItem.actualAmount,
                    shippedAmount: material.amount,
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
        if (!emptyItem) {
            return result;
        }
        return false;
    }
});