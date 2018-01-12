'use strict';

angular.module('app').controller('AdjustListCtrl', function ($scope, $uibModal, $timeout, ApiService) {
    $scope.params = {};
    // 搜索条件中的出库站点选择
    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索条件中的入库站点选择
    $scope.inStationParams = {
        callback: function (data) {
            $scope.params.outStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索
    $scope.search = function () {
        $scope.planGrid.kendoGrid.dataSource.page(1);
    };

    $scope.planGrid = {
        url: '/api/bill/waybill/findWayBillByConditions',
        params: $scope.params,
        dataSource: {
            data: function () {
                return [{isAdjust: true}, {}];
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {
                    title: "操作", width: 80,
                    command: [
                        {
                            name: 'picking', text: "拣货", click: picking,
                            visible: function (item) {
                                return item.isAdjust;
                            }
                        },
                        {
                            name: 'look', text: "查看", click: lookDetails,
                            visible: function (item) {
                                return !item.isAdjust;
                            }
                        }
                    ]
                },
                {field: "xxxxx", title: "站点计划号", width: 120},
                {field: "xxxxx", title: "录单时间", width: 120},
                {field: "xxxxx", title: "录单人", width: 120},
                {field: "xxxxx", title: "出库站点", width: 120},
                {field: "xxxxx", title: "调入站点", width: 120},
                {field: "xxxxx", title: "数量", width: 120},
                {field: "xxxxx", title: "规格品种", width: 120},
                {field: "xxxxx", title: "备注", width: 120}
            ]
        }
    };

    // 拣货
    function picking(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.planDetails = {billCode: '111111111'};
        $scope.planDetailsGrid = {
            kendoSetting: {
                dataSource: [{}, {}],
                columns: [
                    {field: "xxxxx", title: "货物名称", width: 120},
                    {field: "xxxxx", title: "货物编码", width: 120},
                    {field: "xxxxx", title: "所属原料", width: 120},
                    {field: "xxxxx", title: "规格", width: 120},
                    {field: "xxxxx", title: "应拣数量", width: 120},
                    {field: "xxxxx", title: "调入站点", width: 120},
                    {field: "xxxxx", title: "数量", width: 120},
                    {field: "xxxxx", title: "规格品种", width: 120},
                    {field: "xxxxx", title: "备注", width: 120}
                ]
            }
        };
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/planPick.html',
            controller: 'AdjustPlanPickCtrl',
            size: 'lg'
        });
    }

    // 查看详情
    function lookDetails(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.planDetails = {billCode: '111111111'};
        $scope.materialDetails = {
            kendoSetting: {
                dataSource: [{xxxxx: 1}, {xxxxx: 2}],
                columns: [
                    {field: "xxxxx", title: "原料名称", width: 120},
                    {field: "xxxxx", title: "原料编码", width: 120},
                    {field: "xxxxx", title: "应拣数量", width: 120},
                    {field: "xxxxx", title: "实拣数量", width: 120},
                    {field: "xxxxx", title: "完成度", width: 120}
                ]
            }
        };
        $scope.cargoDetails = {
            kendoSetting: {
                dataSource: [{xxxxx: 1}, {xxxxx: 2}],
                columns: [
                    {field: "xxxxx", title: "货物名称", width: 120},
                    {field: "xxxxx", title: "货物编码", width: 120},
                    {field: "xxxxx", title: "所属原料", width: 120},
                    {field: "xxxxx", title: "标准单位", width: 120},
                    {field: "xxxxx", title: "规格", width: 120},
                    {field: "xxxxx", title: "应拣数量", width: 120},
                    {field: "xxxxx", title: "实际数量", width: 120},
                    {field: "xxxxx", title: "标准单位数量", width: 120}
                ]
            }
        };
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/details.html',
            size: 'lg',
            scope: $scope
        });
    }
});