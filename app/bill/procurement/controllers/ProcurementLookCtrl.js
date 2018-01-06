'use strict';

angular.module('app').controller('ProcurementLookCtrl', function ($scope, $stateParams, ApiService, $state, params) {
    // 页面类型 查看or审核
    $scope.type = params.type;
    $scope.bill = params.purchaseBill;

    $scope.procurementGrid = {
        kendoSetting: {
            dataSource: params.purchaseBill.billDetails,
            columns: [
                { field: "cargo.cargoName", title: "货物名称", width: 120 },
                { field: "cargo.cargoCode", title: "货物编码", width: 120 },
                { field: "cargo.rawMaterialId", title: "所属原料", width: 120 },
                { field: "cargo.measurementCode", title: "标准单位", width: 120 },
                { template: "#: cargo.number #/#: cargo.standardUnitCode #", title: "规格", width: 120 },
                { field: "dateInProduced", title: "生产日期", width: 160 },
                { field: "unitPrice", title: "单位进价", width: 120 },
                { field: "amount", title: "实收数量", width: 120 },
                { field: "shippedNumber", title: "发货数量", width: 120 },
                { field: "differenceNumber", title: "数量差额", width: 120 },
                { field: "differencePrice", title: "总价差值", width: 120 }
            ]
        }
    };
    // 通过
    $scope.pass = function () {
        ApiService.post('/api/bill/purchase/auditSuccess', { purchaseBillCode: params.purchaseBill.billCode, auditPersonCode: $.cookie('userCode') }).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功', '', 'success').then(function () {
                    $state.go('app.bill.procurement.list');
                });
            }
        }, apiServiceError);
    };

    // 不通过
    $scope.unPass = function () {
        ApiService.post('/api/bill/purchase/auditFailure', { purchaseBillCode: params.purchaseBill.billCode, auditPersonCode: $.cookie('userCode') }).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功', '', 'success').then(function () {
                    $state.go('app.bill.procurement.list');
                });
            }
        }, apiServiceError);
    };
});