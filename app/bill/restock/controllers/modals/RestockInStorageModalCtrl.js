'use strict';

angular.module('app').controller('RestockInStorageModalCtrl', function ($scope, $timeout, $uibModal, ApiService, Common, data) {
    /**
     查看退库入库单弹窗
     */
    $scope.params = {};
    $scope.cargoConfigure = data.cargoUnit;
    $scope.materialConfigure = data.materialUnit;

    $scope.storageType = [
        {value: 'NORMAL', text: '正常库'},
        {value: 'STORAGE', text: '仓储库'},
        {value: 'IN_STORAGE', text: '进货库'},
        {value: 'OUT_STORAGE', text: '退货库'},
        {value: 'ON_STORAGE', text: '在途库'},
        {value: 'RESERVE_STORAGE', text: '预留库'}
    ];

    $scope.MaterialGrid = {
        primaryId: 'materialCode',
        kendoSetting: {
            columns: [
                {field: "materialName", title: "原料名称"},
                {field: "materialCode", title: "原料编码"},
                {field: "shippedAmount", title: "应拣数量"},
                {field: "actualAmount", title: "实拣数量"},
                {field: "progress", title: "完成度"}
            ]
        }
    };

    $scope.CargoGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialName", title: "所属原料"},
                {field: "standardUnitCode", title: "标准单位", template: function (data) {
                        return getTextByVal($scope.materialConfigure, data.standardUnitCode);
                }},
                {
                    title: "规格", template: function (data) {
                        return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                    }
                },
                // {field: "shippedAmount", title: "应拣数量"},
                {field: "actualAmount", title: "实拣数量"},
                {
                    title: "标准单位数量", template: function (data) {
                        return parseInt(data.number) * parseInt(data.actualAmount)
                    }
                }
            ]
        }
    };

    $scope.onlyCargoGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialName", title: "所属原料"},
                {field: "standardUnitCode", title: "标准单位", template: function (data) {
                        return getTextByVal($scope.materialConfigure, data.standardUnitCode);
                }},
                {
                    title: "规格", template: function (data) {
                        return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                    }
                },
                {field: "shippedAmount", title: "应拣数量"},
                {field: "actualAmount", title: "实拣数量"},
                {
                    title: "标准单位数量", template: function (data) {
                        return parseInt(data.number) * parseInt(data.actualAmount)
                    }
                }
            ]
        }
    };

    // 查看单条计划详情
    var getURL = '/api/bill/restock/findInStorageByBillCode';
    ApiService.get(getURL + '?billCode=' + data.billCode).then(function (response) {
        if (response.code = '000') {
            var res = response.result.bill;
            _.each(['billCode', 'createTime', 'inWareHouseTime', 'inLocation', 'outLocation', 'planMemo', 'operatorName', 'totalVarietyAmount', 'totalAmount',
                'auditMemo', 'outStorageMemo'], function (name) {
                $scope.params[name] = res[name]
            });
            $scope.showMaterial = (res.basicEnum !== 'BY_CARGO');
            $scope.params.billType = getTextByVal($scope.specificType, res.specificBillType) + '转';
            $scope.params.inStationName = getTextByVal($scope.station, res.inLocation.stationCode);
            $scope.params.outStationName = getTextByVal($scope.station, res.outLocation.stationCode);
            $scope.params.inStorageName = getTextByVal($scope.storageType, res.inLocation.storage.storageCode);
            // 查询相应站点的出库库位名称

            // Common.getStore(res.inLocation.stationCode).then(function (storageList) {
            //     _.each(storageList, function (item) {
            //         if (item.tempStorageCode === res.inLocation.storage.storageCode) {
            //             $scope.params.inStorageName = item.tempStorageName
            //         }
            //     })
            // });
            $scope.params.outStorageName = getTextByVal($scope.storageType, res.outLocation.storage.storageCode);
            // Common.getStore(res.outLocation.stationCode).then(function (storageList) {
            //     _.each(storageList, function (item) {
            //         if (item.tempStorageCode === res.outLocation.storage.storageCode) {
            //             $scope.params.outStorageName = item.tempStorageName
            //         }
            //     })
            // });

            var billDetails = [], cargoList = [];
            if ($scope.showMaterial) {
                // 取出单据信息
                billDetails = res.billDetails;
                cargoList = _.map(billDetails, function (item) {
                    return item.rawMaterial.cargo.cargoCode
                });

                $timeout(function () {
                    Common.getCargoByCodes(cargoList).then(function (cargoList) {
                        var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                            return item.cargoCode
                        }), cargoList);

                        var materialList = [];
                        _.each(billDetails, function (item) {
                            // 将相应货物信息添加进billDetails
                            item.cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                            materialList.push(item.rawMaterial.rawMaterialCode)
                        });
                        Common.getMaterialByCodes(materialList).then(function (materialList) {
                            var materialObject = _.zipObject(_.map(materialList, function (item) {
                                return item.materialCode
                            }), materialList);
                            _.each(billDetails, function (item) {
                                item.material = materialObject[item.rawMaterial.rawMaterialCode];
                                $scope.CargoGrid.kendoGrid.dataSource.add({
                                    cargoName: item.cargo.cargoName,
                                    cargoCode: item.cargo.cargoCode,
                                    rawMaterialName: item.material.materialName,
                                    rawMaterialCode: item.material.materialCode,
                                    number: item.cargo.number,
                                    standardUnitCode: item.cargo.standardUnitCode,
                                    shippedAmount: item.shippedAmount,
                                    actualAmount: item.actualAmount,
                                    measurementCode: item.cargo.measurementCode
                                });
                                var isExist = false;
                                $scope.materialResult = _.map($scope.materialResult, function (result) {
                                    if (result.materialCode === item.rawMaterial.rawMaterialCode) {
                                        isExist = true;
                                        // 累加已拣数量
                                        result.actualAmount += (parseInt(item.actualAmount) * parseInt(item.cargo.number))
                                    }
                                    return result
                                });
                                if (!isExist) {
                                    var sa = item.shippedAmount,
                                        aa = parseInt(item.actualAmount) * parseInt(item.cargo.number),
                                        pg = parseFloat(aa / parseInt(sa) * 100).toFixed(2) + '%';
                                    $scope.materialResult.push({
                                        materialName: item.material.materialName,
                                        materialCode: item.rawMaterial.rawMaterialCode,
                                        shippedAmount: sa,
                                        actualAmount: aa,
                                        progress: pg
                                    })
                                }
                            });
                            _.each($scope.materialResult, function (item) {
                                $scope.MaterialGrid.kendoGrid.dataSource.add(item)
                            })
                        })
                    })
                })
            } else {
                billDetails = res.billDetails;
                cargoList = _.map(billDetails, function (item) {
                    return item.rawMaterial.cargo.cargoCode
                });
                Common.getCargoByCodes(cargoList).then(function (cargoList) {
                    var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                        return item.cargoCode
                    }), cargoList);

                    var materialList = [];

                    _.each(billDetails, function (item) {
                        // 将相应货物信息添加进billDetails
                        item.cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                        materialList.push(item.rawMaterial.rawMaterialCode)
                    });

                    Common.getMaterialByCodes(materialList).then(function (materialList) {
                        var materialObject = _.zipObject(_.map(materialList, function (item) {
                            return item.materialCode
                        }), materialList);
                        _.each(billDetails, function (item) {
                            // materialList: 原料详细信息
                            item.material = materialObject[item.rawMaterial.rawMaterialCode];
                            $scope.onlyCargoGrid.kendoGrid.dataSource.add({
                                cargoName: item.cargo.cargoName,
                                cargoCode: item.cargo.cargoCode,
                                rawMaterialName: item.material.materialName,
                                number: item.cargo.number,
                                standardUnitCode: item.cargo.standardUnitCode,
                                amount: item.cargo.amount,
                                actualAmount: item.actualAmount,
                                shippedAmount: item.shippedAmount,
                                measurementCode: item.cargo.measurementCode
                            })
                        })
                    })
                })
            }
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError);

    // 导出
    $scope.export = function () {
        alert('export')
    };
});