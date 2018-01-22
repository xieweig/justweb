'use strict';

angular.module('app').controller('TurnoverDetailsCtrl', function ($scope) {
    $scope.detailsGrid = {
        url: '/api/bill/waybill/findWayBillByConditions',
        params: $scope.params,
        dataSource: {
            data: function () {
                return [{}, {}];
            }
        },
        kendoSetting: {
            columns: [
                // {title: "操作", width: 80, command: [{name: 'look', text: "查看", click: lookDetails}]},
                {field: "xxxxx", title: "货物名称"},
                {field: "xxxxx", title: "货物编码", width: 120},
                {field: "xxxxx", title: "所属原料", width: 120},
                {field: "xxxxx", title: "规标准单位", width: 120},
                {field: "xxxxx", title: "规格", width: 120},
                {field: "xxxxx", title: "调拨数量", width: 120},
                {field: "xxxxx", title: "调拨标准单位数量", width: 120},
                {field: "xxxxx", title: "实调数量", width: 120},
                {field: "xxxxx", title: "货物误差", width: 120},
                {field: "xxxxx", title: "原料误差", width: 120}
            ]
        }
    };
});