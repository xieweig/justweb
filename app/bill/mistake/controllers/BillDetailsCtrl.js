'use strict';

angular.module('app').controller('BillDetailsCtrl', function ($scope, $uibModal, params) {
    if (params.type === 'cargo') {
        $scope.detailsGrid = {
            url: '/api/bill/waybill/findWayBillByConditions',
            params: $scope.params,
            dataSource: {
                data: function () {
                    return [{}, {}];
                }
            },
            kendoSetting: {
                autoBind: false,
                pageable: true,
                columns: [
                    // {title: "操作", width: 80, command: [{name: 'look', text: "查看", click: lookDetails}]},
                    {field: "xxxxx", title: "货物名称"},
                    {field: "xxxxx", title: "货物编码", width: 120},
                    {field: "xxxxx", title: "所属原料", width: 120},
                    {field: "xxxxx", title: "规格", width: 120},
                    {field: "xxxxx", title: "货物数量", width: 120}
                ]
            }
        };
    } else {
        $scope.detailsGrid = {
            url: '/api/bill/waybill/findWayBillByConditions',
            params: $scope.params,
            dataSource: {
                data: function () {
                    return [{}, {}];
                }
            },
            kendoSetting: {
                autoBind: false,
                pageable: true,
                columns: [
                    // {title: "操作", width: 80, command: [{name: 'look', text: "查看", click: lookDetails}]},
                    {field: "xxxxx", title: "原料编码"},
                    {field: "xxxxx", title: "原料名称", width: 120},
                    {field: "xxxxx", title: "原料所属分类", width: 120},
                    {field: "xxxxx", title: "报溢数量", width: 120},
                    {field: "xxxxx", title: "标准单位", width: 120}
                ]
            }
        };
    }

});