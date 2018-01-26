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
                $scope.billDetails.inLocation.stationName = getTextByVal($scope.station, $scope.billDetails.inLocation.stationCode);
                $scope.billDetails.outLocation.stationName = getTextByVal($scope.station, $scope.billDetails.outLocation.stationCode);
                $scope.billDetails.outStateName = getTextByVal($scope.outStateEnum, $scope.billDetails.outStateEnum);
                $scope.billDetails.submitStatusName = getTextByVal($scope.submitStatus, $scope.billDetails.submitState);
                $scope.billDetails.auditStateName = getTextByVal($scope.auditStatus, $scope.billDetails.auditState);
                if ($scope.billDetails.outLocation.storage) {
                    $scope.billDetails.outLocation.storage.storageName = getTextByVal($scope.outType, $scope.billDetails.outLocation.storage.storageCode);
                }
                if ($scope.billDetails.inLocation.storage) {
                    $scope.billDetails.inLocation.storage.storageName = getTextByVal($scope.outType, $scope.billDetails.inLocation.storage.storageCode);
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
                                    field: "shippedAmount", title: "应拣数量", width: 120,
                                    visible: function () {
                                        return $scope.billDetails.basicEnum !== 'BY_MATERIAL';
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
                            $scope.materialDetails = {
                                kendoSetting: {
                                    dataSource: _.map(materialList, function (item) {
                                        var material = materialObject[item.rawMaterial.rawMaterialCode];
                                        // material.standardUnitName = getTextByVal(params.materialUnit, cargo.standardUnitCode);
                                        // material.measurementName = getTextByVal(params.cargoUnit, cargo.measurementCode);
                                        material.shippedAmount = item.shippedAmount;
                                        material.actualAmount = item.actualAmount;
                                        console.log(material);
                                        return material;
                                    }),
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
                        var dataSource = $scope.cargoDetails.kendoGrid.dataSource;
                        console.log(data);
                        dataSource.data(combinationItem(data));
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
});