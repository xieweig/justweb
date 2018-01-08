'use strict';

angular.module('app').controller('PlanViewModalCtrl', function ($scope, ApiService, Common, data) {
    /**
     查看站点退库计划弹窗
     */
    $scope.params = {};
    // 请求单条计划详情
    ApiService.post('/api/bill/planBill/findByBillCode?billCode=' + data.billCode ).then(function (response) {
        if (response.code === '000') {
            var res = response.result.planBill;
            $scope.params.billCode = res.billCode;
            $scope.params.memo = res.memo;
            $scope.params.recordTime = res.createTime;
            $scope.params.outStationName = res.outStationCode;
            $scope.params.inStationName = res.inStationCode;

            var billDetails = response.result.planBill.childPlanBillDetails;
            var cargoList = _.map(billDetails, function (item) {
                return item.goodsCode
            });
            Common.getCargoByCodes(cargoList).then(function (cargoList) {
                // cargoList: 货物详细信息
                var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                    return item.cargoCode
                }), cargoList);
                _.each(billDetails, function (item) {
                    item.cargo = cargoObject[item.goodsCode];
                    if (!item.cargo) {
                        item.cargo = {};
                    } else {
                        $scope.cargoGrid.kendoGrid.dataSource.add({
                            cargoName:item.cargo.cargoName,
                            cargoCode: item.cargo.cargoCode,
                            rawMaterialName: item.cargo.rawMaterialName,
                            number: item.cargo.number,
                            standardUnitCode: item.cargo.standardUnitCode,
                            amount: item.cargo.amount // amount是请求的数据来的
                        })
                    }
                });
            })
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError);

    $scope.cargoGrid = {
        kendoSetting: {
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialName", title: "所属原料"},
                {title: "规格", template: "#: cargo.number #/#: cargo.standardUnitCode #", width: 120},
                {field: "amount", title: "应拣数量"}
            ]
        }
    };

    // 导出
    $scope.export = function () {
        alert('export')
    };
});