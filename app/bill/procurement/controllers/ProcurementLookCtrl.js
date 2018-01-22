'use strict';

angular.module('app').controller('ProcurementLookCtrl', function ($scope, $stateParams, ApiService, $state, params) {
    // 页面类型 查看or审核
    $scope.type = params.type;
    $scope.bill = params.purchaseBill;
    console.log($scope.bill);
    $scope.procurementGrid = {
        kendoSetting: {
            dataSource: params.purchaseBill.billDetails,
            columns: [
                {field: "cargoName", title: "货物名称", width: 120},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "rawMaterialId", title: "所属原料", width: 120},
                {field: "measurementCode", title: "标准单位", width: 120},
                {template: "#: cargo.number #/#: cargo.standardUnitCode #", title: "规格", width: 120},
                {field: "dateInProduced", title: "生产日期", width: 160},
                {field: "unitPrice", title: "单位进价", width: 120},
                {field: "actualAmount", title: "实收数量", width: 120},
                {field: "shippedAmount", title: "发货数量", width: 120},
                {field: "differenceNumber", title: "数量差额", width: 120},
                {
                    field: "differencePrice", title: "总价差值", width: 120,
                    template: function (data) {
                        return (parseFloat(data.unitPrice) * data.differenceNumber).toFixed(2);
                    }
                }
            ]
        }
    };

    // 不通过
    $scope.doPass = function (pass) {
        var url = '';
        var auditParams = {billCode: params.purchaseBill.billCode, auditMemo: ''};
        if (pass) {
            url = '/api/bill/purchase/auditSuccess';
        } else {
            url = '/api/bill/purchase/auditFailure';
        }
        ApiService.post(url, auditParams).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功', '', 'success').then(function () {
                    $scope.$close();
                });
            }
        }, apiServiceError);
    };
});