'use strict';

angular.module('app').controller('ReturnedPlanViewModalCtrl', function ($scope, $rootScope, $timeout, ApiService, Common, data) {
    /**
     查看站点退货计划弹窗
     */
    $scope.params = {};

    $scope.cargoGrid = {
        kendoSetting: {
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialName", title: "所属原料"},
                {title: "规格", template: "#: number #/#: standardUnitCode #", width: 120},
                {field: "amount", title: "应拣数量"}
            ]
        }
    };

    // 请求单条计划详情
    ApiService.post('/api/bill/returned/findPlanBillByBillCode?billCode=' + data.billCode).then(function (response) {
        if (response.code === '000') {
            var res = response.result.planBill;
            $scope.params.billCode = res.billCode;
            $scope.params.memo = res.memo;
            $scope.params.recordTime = res.createTime;
            $scope.params.outStationName = getTextByVal($scope.station, res.outStationCode);
            $scope.params.inStationName = getTextByVal($scope.station, res.inStationCode);

            var billDetails = res.childPlanBillDetails;

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
                            amount: item.amount
                        })
                    })
                })
            })
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError);

    // 导出
    $scope.export = function () {
        alert('export')
    };
});