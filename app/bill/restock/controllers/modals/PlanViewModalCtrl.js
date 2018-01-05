'use strict';

angular.module('app').controller('PlanViewModalCtrl', function ($scope, ApiService, Common, data) {
    /**
     查看站点退库计划弹窗
     */
    $scope.params = {};

    // 请求单条计划详情
    ApiService.get('http://localhost:5000/api/bill/restock/findPlanOne?id=' + data.billCode, {hasHost: true}).then(function (response) {
        if (response.code === '000') {
            var res = response.result.content[0];
            $scope.params.billCode = res.billCode;
            $scope.params.remarks = res.memo;
            $scope.params.recordTime = res.createTime;
            $scope.params.outStationName = res.outStation;
            $scope.params.inStationName = res.inStation;

            var billDetails = response.result.content[0].BillDetails;
            var cargoList = _.map(billDetails, function (item) {
                return item.货物编码
            });
            Common.getCargoByCodes(cargoList).then(function (cargoList) {
                // cargoList: 货物详细信息
                var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                    return item.cargoCode
                }), cargoList);
                _.each(billDetails, function (item) {
                    item.cargo = cargoObject[item.货物编码];
                    if (!item.cargo) {
                        item.cargo = {};
                    } else {
                        $scope.cargoGrid.kendoGrid.dataSource.add({
                            cargoName:item.cargo.cargoName,
                            cargoCode: item.cargo.cargoCode,
                            rawMaterialName: item.cargo.rawMaterialName,
                            number: item.cargo.number,
                            standardUnitCode: item.cargo.standardUnitCode,
                            amount: item.cargo.amount
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