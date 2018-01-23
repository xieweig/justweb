'use strict';

angular.module('app').controller('RestockPlanViewModalCtrl', function ($scope, $rootScope, $timeout, ApiService, Common, data) {
    /**
     查看站点退库计划弹窗
     */
    $scope.params = {};
    $scope.cargoConfigure = data.cargoUnit;
    $scope.materialConfigure = data.materialUnit;

    $scope.cargoGrid = {
        kendoSetting: {
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialName", title: "所属原料"},
                {
                    title: "规格", template: function (data) {
                        return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                    }, width: 120
                },
                {field: "amount", title: "应拣数量"}
            ]
        }
    };

    $scope.materialGrid = {
        primaryId: 'materialCode',
        kendoSetting: {
            columns: [
                {field: "materialName", title: "原料名称"},
                {field: "materialCode", title: "原料编码"},
                {
                    title: "标准单位", width: 120, template: function (data) {
                        return getTextByVal($scope.materialConfigure, data.standardUnitCode)
                    }
                },
                {field: "shippedAmount", title: "应拣数量"}
            ]
        }
    };

    // 请求单条计划详情
    ApiService.get('/api/bill/restock/findPlanByBillCode?billTypeEnum=RESTOCK&billCode=' + data.billCode).then(function (response) {
        if (response.code === '000') {
            var res = response.result.bill;
            $scope.params.billCode = res.billCode;
            $scope.params.planMemo = res.planMemo;
            $scope.params.recordTime = res.createTime;
            $scope.params.outStationName = getTextByVal($scope.station, res.outStationCode);
            $scope.params.inStationName = getTextByVal($scope.station, res.inStationCode);

            var billDetails = res.childPlanBillDetails;
            $scope.showMaterial = (res.basicEnum !== 'BY_CARGO');
            if ($scope.showMaterial) {
                var materialCodeList = _.map(billDetails, function (item) {
                    return item.rawMaterial.rawMaterialCode
                });
                Common.getMaterialByCodes(materialCodeList).then(function (materialList) {
                    var materialObject = _.zipObject(_.map(materialList, function (item) {
                        return item.materialCode
                    }), materialList);

                    _.each(billDetails, function (item) {
                        item.material = materialObject[item.rawMaterial.rawMaterialCode];
                        $scope.materialGrid.kendoGrid.dataSource.add({
                            materialName: item.material.materialName,
                            materialCode: item.material.materialCode,
                            standardUnitCode: item.material.standardUnitCode,
                            shippedAmount: item.amount
                        })
                    })
                })
            } else {
                var cargoList = _.map(billDetails, function (item) {
                    return item.rawMaterial.cargo.cargoCode
                });

                Common.getCargoByCodes(cargoList).then(function (cargoList) {
                    // cargoList: 货物详细信息
                    var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                        return item.cargoCode
                    }), cargoList);
                    var materialList = [];
                    _.each(billDetails, function (item) {
                        item.cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                        materialList.push(item.rawMaterial.rawMaterialCode)
                    });
                    // 获取原料信息
                    Common.getMaterialByCodes(materialList).then(function (materialList) {
                        var materialObject = _.zipObject(_.map(materialList, function (item) {
                            return item.materialCode
                        }), materialList);
                        _.each(billDetails, function (item) {
                            item.material = materialObject[item.rawMaterial.rawMaterialCode];
                            $scope.cargoGrid.kendoGrid.dataSource.add({
                                cargoName: item.cargo.cargoName,
                                cargoCode: item.cargo.cargoCode,
                                rawMaterialName: item.material.materialName,
                                number: item.cargo.number,
                                standardUnitCode: item.cargo.standardUnitCode,
                                measurementCode: item.cargo.measurementCode,
                                amount: item.amount
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