'use strict';

angular.module('app').controller('AdjustDetailsCtrl', function ($scope, ApiService, Common, $uibModal, params) {
    if (!params.billCode) {
        swal('没有单据号', '', 'warning');
        $scope.$close();
    } else {
        ApiService.get('/api/bill/adjust/findOutStorageByBillCode?billCode=' + params.billCode).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error').then(function () {
                    $scope.$close();
                });
            } else {
                if (!response.result.bill) {
                    swal('未找到单据', '', 'warning').then(function () {
                        $scope.$close();
                    });
                    return;
                }
                $scope.billDetails = response.result.bill;
                $scope.billDetails.type = params.type;
                // 初始化站点名称
                $scope.billDetails.outStateName = getTextByVal($scope.outStateEnum, $scope.billDetails.outStateEnum);
                $scope.billDetails.submitStatusName = getTextByVal($scope.submitStatus, $scope.billDetails.submitState);
                $scope.billDetails.auditStateName = getTextByVal($scope.auditStatus, $scope.billDetails.auditState);
                $scope.billDetails.sourceBillTypeName = getTextByVal($scope.sourceBillType, $scope.billDetails.sourceBillType);
                if ($scope.billDetails.inLocation) {
                    $scope.billDetails.inLocation.stationName = getTextByVal($scope.station, $scope.billDetails.inLocation.stationCode);
                    if ($scope.billDetails.inLocation.storage) {
                        $scope.billDetails.inLocation.storage.storageName = getTextByVal($scope.outType, $scope.billDetails.inLocation.storage.storageCode);
                    }
                }
                if ($scope.billDetails.outLocation) {
                    $scope.billDetails.outLocation.stationName = getTextByVal($scope.station, $scope.billDetails.outLocation.stationCode);
                    if ($scope.billDetails.outLocation.storage) {
                        $scope.billDetails.outLocation.storage.storageName = getTextByVal($scope.outType, $scope.billDetails.outLocation.storage.storageCode);
                    }
                }

                // 获取原料和货物的code集合
                var materialCodes = [];
                var cargoCodes = [];
                _.each($scope.billDetails.billDetails, function (item) {
                    cargoCodes.push(item.rawMaterial.cargo.cargoCode);
                    materialCodes.push(item.rawMaterial.rawMaterialCode);
                });
                Common.getCargoByCodes(cargoCodes).then(function (cargoList) {
                    var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                        return item.cargoCode
                    }), cargoList);
                    // 货物列表
                    $scope.cargoDetails = {
                        kendoSetting: {
                            dataSource: _.map($scope.billDetails.billDetails, function (item) {
                                var cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                                cargo.standardUnitName = getTextByVal(params.materialUnit, cargo.standardUnitCode);
                                cargo.measurementName = getTextByVal(params.cargoUnit, cargo.measurementCode);
                                cargo.shippedAmount = item.shippedAmount;
                                cargo.actualAmount = item.actualAmount;
                                return cargo;
                            }),
                            columns: [
                                {field: "cargoName", title: "货物名称", width: 120},
                                {field: "cargoCode", title: "货物编码", width: 120},
                                {field: "rawMaterialName", title: "所属原料", width: 120},
                                {field: "standardUnitName", title: "标准单位", width: 120},
                                {template: "#: data.number + data.measurementName #", title: "规格", width: 120},
                                {
                                    title: "应拣数量", width: 120,
                                    template: function () {
                                        if ($scope.billDetails.basicEnum === 'BY_CARGO') {
                                            return data.shippedAmount;
                                        }
                                        return '-';
                                    }
                                },
                                {field: "actualAmount", title: "实际数量", width: 120},
                                {
                                    title: "标准单位数量", width: 120,
                                    template: function (data) {
                                        return parseInt(data.number) * parseInt(data.actualAmount);
                                    }
                                }
                            ]
                        }
                    };

                    // 需要获取原料的id为添加货物的时候 提供原料的范围限制
                    $scope.materialIds = [];
                    Common.getMaterialByCodes(materialCodes).then(function (materialList) {
                        $scope.materialIds = _.map(materialList, function (item) {
                            return item.materialId;
                        });
                        // 原料
                        if ($scope.billDetails.basicEnum === 'BY_MATERIAL') {
                            var materialObject = _.zipObject(_.map(materialList, function (item) {
                                return item.materialCode
                            }), materialList);

                            // 去除重复的原料
                            materialList = _.uniq($scope.billDetails.billDetails, function (item) {
                                return item.rawMaterial.rawMaterialCode;
                            });
                            $scope.materialList = _.map(materialList, function (item) {
                                var material = materialObject[item.rawMaterial.rawMaterialCode];
                                material.shippedAmount = item.shippedAmount;
                                material.actualAmount = item.actualAmount;
                                return material;
                            });
                            $scope.materialDetails = {
                                kendoSetting: {
                                    dataSource: $scope.materialList,
                                    columns: [
                                        {field: "materialName", title: "原料名称", width: 120},
                                        {field: "materialCode", title: "原料编码", width: 120},
                                        {field: "shippedAmount", title: "应拣数量", width: 120},
                                        {field: "actualAmount", title: "实拣数量", width: 120},
                                        {
                                            title: "完成度", width: 120,
                                            template: function (data) {
                                                return ( parseInt(data.actualAmount) / parseInt(data.shippedAmount)).toPercent();
                                            }
                                        }
                                    ]
                                }
                            };
                        }
                    });
                });

            }
        }, apiServiceError);
    }

    // 原料选择货物
    $scope.chooseCargo = function () {
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/addCargoModal.html',
            size: 'lg',
            controller: 'AdjustAddCargoCtrl',
            resolve: {
                params: {
                    cargoUnit: params.cargoUnit,
                    materialUnit: params.materialUnit,
                    material: {materialId: $scope.materialIds.join()},
                    data: combinationItem($scope.cargoDetails.kendoGrid.dataSource.data()),
                    cb: function (data) {
                        var dataSource = combinationItem(data);
                        $scope.cargoDetails.kendoGrid.dataSource.data(dataSource);
                        // 如果有原料列表  则需要更新原料列表的完成度
                        if ($scope.billDetails.basicEnum === 'BY_MATERIAL') {
                            var materialObject = {};
                            _.each(dataSource, function (item) {
                                if (!materialObject[item.rawMaterialCode]) {
                                    materialObject[item.rawMaterialCode] = {actualAmount: 0};
                                }
                                materialObject[item.rawMaterialCode].actualAmount += parseInt(item.actualAmount);
                            });
                            _.each($scope.materialList, function (item) {
                                if (materialObject[item.materialCode]) {
                                    item.actualAmount = materialObject[item.materialCode].actualAmount;
                                } else {
                                    item.actualAmount = 0;
                                }
                            });
                            $scope.materialDetails.kendoGrid.dataSource.data($scope.materialList);
                        }
                    }
                }
            }
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
                measurementName: getTextByVal(params.cargoUnit, item.measurementCode),
                standardUnitCode: item.standardUnitCode,
                standardUnitName: getTextByVal(params.materialUnit, item.standardUnitCode),
                number: item.number,
                actualAmount: item.actualAmount || 0
            };
        });
    }


    // 保存拣货
    $scope.savePick = function () {
        var bill = getParams('save');
        var url = '';
        if ($scope.billDetails.self) {
            url = '/api/bill/adjust/saveBySelf';
        } else {
            url = '/api/bill/adjust/save'
        }
        ApiService.post(url, bill).then(function (response) {
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
        var url = '';
        if ($scope.billDetails.self) {
            url = '/api/bill/adjust/submitBySelf';
        } else {
            url = '/api/bill/adjust/submit'
        }
        ApiService.post(url, bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功!', '', 'success').then(function () {
                    $scope.$close();
                });
            }
        }, apiServiceError);
    };

    function getParams(type) {
        var result = {
            sourceCode: $scope.billDetails.billCode,
            basicEnum: $scope.billDetails.basicEnum,
            billPurpose: $scope.billDetails.billPurpose,
            self: $scope.billDetails.self,
            billType: $scope.billDetails.billType,
            inLocation: $scope.billDetails.inLocation,
            outLocation: $scope.billDetails.outLocation,
            auditMemo: $scope.billDetails.auditMemo,
            billDetails: []
        };
        _.each($scope.cargoDetails.kendoGrid.dataSource.data(), function (dataItem) {
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
        });
        return result;
    }


    // 审核通过or不通过
    $scope.audit = function (pass) {
        var params = {
            billCode: $scope.billDetails.billCode,
            auditMemo: $scope.billDetails.auditMemo
        };
        var url = '';
        if (!pass) {
            url = '/api/bill/adjust/auditFailure';
        } else {
            url = '/api/bill/adjust/auditSuccess';
        }
        ApiService.post(url, params).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功!', '', 'success').then(function () {
                    $scope.$close();
                });
            }
        }, apiServiceError);
    }

    // 审核不通过
});