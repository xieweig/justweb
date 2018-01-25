'use strict';

angular.module('app').controller('AdjustDetailsCtrl', function ($scope, ApiService, Common, params) {
    if (!params.billCode) {
        swal('没有单据号', '', 'warning');
        $scope.$close();
    } else {
        ApiService.get('/api/bill/adjust/findOutStorageByBillCode?billCode=' + params.billCode).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error')
            } else {
                $scope.billDetails = response.result.bill;
                $scope.billDetails.type = params.type;
                var materialCodes = [];
                var cargoCodes = [];
                _.each($scope.billDetails.billDetails, function (item) {
                    materialCodes.push(item.rawMaterial.rawMaterialCode);
                    cargoCodes.push(item.rawMaterial.cargo.cargoCode);
                });
                Common.getCargoByCodes(cargoCodes).then(function (cargoList) {
                    var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                        return item.cargoCode
                    }), cargoList);
                    if ($scope.billDetails.basicEnum === 'BY_MATERIAL') {
                        $scope.materialDetails = {
                            kendoSetting: {
                                columns: [
                                    {field: "xxxxx", title: "原料名称", width: 120},
                                    {field: "xxxxx", title: "原料编码", width: 120},
                                    {field: "xxxxx", title: "应拣数量", width: 120},
                                    {field: "xxxxx", title: "实拣数量", width: 120},
                                    {field: "xxxxx", title: "完成度", width: 120}
                                ]
                            }
                        };
                    }
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
                });

            }
        }, apiServiceError);
    }
});