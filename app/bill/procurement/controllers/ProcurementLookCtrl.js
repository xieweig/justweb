'use strict';

angular.module('app').controller('ProcurementLookCtrl', function ($scope, $stateParams) {
    // 页面类型 查看or审核
    $scope.type = $stateParams.type;

    $scope.procurementGrid = {
        kendoSetting: {
            columns: [
                { field: "xxxxxxxxxx", title: "货物名称", width: 120 },
                { field: "xxxxxxxxxx", title: "货物编码", width: 120 },
                { field: "xxxxxxxxxx", title: "所属原料", width: 120 },
                { field: "xxxxxxxxxx", title: "标准单位", width: 120 },
                { field: "xxxxxxxxxx", title: "规格", width: 120 },
                { field: "xxxxxxxxxx", title: "生产日期", width: 120 },
                { field: "xxxxxxxxxx", title: "单位进价", width: 120 },
                { field: "xxxxxxxxxx", title: "实收数量", width: 120 },
                { field: "xxxxxxxxxx", title: "发货数量", width: 120 },
                { field: "xxxxxxxxxx", title: "数量差额", width: 120 },
                { field: "xxxxxxxxxx", title: "总价差值", width: 120 }
            ]
        }
    };

    setTimeout(function () {
        $scope.procurementGrid.kendoGrid.dataSource.data([
            { xxxxxxxxxx: 1, audit: false, submit: true },
            { xxxxxxxxxx: 2, audit: true, submit: true },
            { xxxxxxxxxx: 3, audit: false, submit: false },
            { xxxxxxxxxx: 4, audit: true, submit: true }
        ]);
    }, 100);
});