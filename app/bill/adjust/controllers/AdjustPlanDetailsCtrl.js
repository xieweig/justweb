'use strict';

angular.module('app').controller('AdjustPlanDetailsCtrl', function ($scope, ApiService, Common, params) {
    if (!params.billCode) {
        swal('单号不存在').then(function () {
            $scope.$close();
        });
    } else {
        ApiService.get('/api/bill/adjust/findPlanByBillCode?billCode=' + params.billCode).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error')
            } else {
                var planDetails = response.result.bill;
                planDetails.type = 'look';
                planDetails.inStationName = getTextByVal($scope.station, planDetails.inStationCode);
                planDetails.outStationName = getTextByVal($scope.station, planDetails.outStationCode);
                initDetails(planDetails);
            }
        }, apiServiceError);
    }

    // 初始化数据
    function initDetails(planDetails) {
        if (planDetails.basicEnum === 'BY_CARGO') {
            var cargoCodes = _.map(planDetails.childPlanBillDetails, function (item) {
                return item.rawMaterial.cargo.cargoCode;
            });
            Common.getCargoByCodes(cargoCodes).then(function (cargoList) {
                var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                    return item.cargoCode
                }), cargoList);
                $scope.detailsGrid = {
                    kendoSetting: {
                        dataSource: _.map(planDetails.childPlanBillDetails, function (item) {
                            var cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                            return {
                                cargoName: cargo.cargoName,
                                cargoCode: cargo.cargoCode,
                                rawMaterialName: cargo.rawMaterialName,
                                number: cargo.number,
                                measurementName: getTextByVal(params.cargoUnit, cargo.measurementCode),
                                actualAmount: item.amount
                            };
                        }),
                        columns: [
                            {field: "cargoName", title: "货物名称", width: 120},
                            {field: "cargoCode", title: "货物编码", width: 120},
                            {field: "rawMaterialName", title: "所属原料", width: 120},
                            {title: "规格", width: 120, template: '#: data.number + data.measurementName #'},
                            {field: "actualAmount", title: "应拣数量", width: 120}
                        ]
                    }
                };
            });
        } else {
            var materialCodes = _.map(planDetails.childPlanBillDetails, function (item) {
                return item.rawMaterial.rawMaterialCode;
            });
            Common.getMaterialByCodes(materialCodes).then(function (materialList) {
                var materialObject = _.zipObject(_.map(materialList, function (item) {
                    return item.materialCode
                }), materialList);
                $scope.detailsGrid = {
                    kendoSetting: {
                        dataSource: _.map(planDetails.childPlanBillDetails, function (item) {
                            var material = materialObject[item.rawMaterial.rawMaterialCode];
                            return {
                                materialName: material.materialName,
                                materialCode: material.materialCode,
                                standardUnitName: material.standardUnitName,
                                actualAmount: item.amount
                            };
                        }),
                        columns: [
                            {field: "materialName", title: "原料名称", width: 120},
                            {field: "materialCode", title: "原料编码", width: 120},
                            {field: "standardUnitName", title: "标准单位", width: 120},
                            {field: "actualAmount", title: "应拣数量", width: 120}
                        ]
                    }
                };
            });
        }
    }
});