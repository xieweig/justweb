'use strict';

angular.module('app').controller('AdjustInStorageListCtrl', function ($scope, $timeout, $uibModal) {
    $scope.params = {};
    $scope.adjustBillType = [
        {key: 'DELIVERY', value: 'DELIVERY', text: '配送计划转'},
        {key: 'ADJUST', value: 'ADJUST', text: '调剂计划转'},
        {key: 'RETURNED', value: 'RETURNED', text: '退货计划转'},
        {key: 'RETURNED', value: 'RETURNED', text: '无计划'}
    ];

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

    $scope.search = function () {
        $scope.billGrid.kendoGrid.dataSource.page(1);
    };
    $scope.billGrid = {
        url: '/api/bill/waybill/findWayBillByConditions',
        params: $scope.params,
        dataSource: {
            data: function () {
                return [{a: 123213}, {a: 12321}];
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {title: '操作', command: [{name: 'l', text: "查看", click: lookDetails}, {name: 'u', text: "调拨", click: transferPlan}], width: 160},
                {field: "xxxxx", title: "单据属性", width: 120},
                {field: "xxxxx", title: "出库状态", width: 120},
                {field: "xxxxx", title: "提交状态", width: 120},
                {field: "xxxxx", title: "审核状态", width: 120},
                {title: "来源单号", width: 120, template: '<span class="kendo-link showSourceBill" sourceCode="#: data.a #">#: data.a #</span>'},
                {field: "xxxxx", title: "出库单号", width: 120},
                {field: "xxxxx", title: "录单时间", width: 120},
                {field: "xxxxx", title: "出库时间", width: 120},
                {field: "xxxxx", title: "录单人", width: 120},
                {field: "xxxxx", title: "审核人", width: 120},
                {field: "xxxxx", title: "出库站点", width: 120},
                {field: "xxxxx", title: "入库站点", width: 120},
                {field: "xxxxx", title: "配送数量", width: 120},
                {field: "xxxxx", title: "配送品种数", width: 120}
            ]
        }
    };

    $timeout(function () {
        // 点击来源单号的事件
        $('#billGrid').on('click', '.showSourceBill', function () {
            var sourceCode = $(this).attr('sourceCode');
            $uibModal.open({
                templateUrl: 'app/bill/adjust/modals/details.html',
                size: 'lg',
                scope: $scope,
                controller: 'AdjustDetailsCtrl',
                resolve: {
                    params: {
                        type: 'look',
                        billCode: '123123'
                    }
                }
            });
        });
    });


    // 查看详情
    function lookDetails(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        loadBillDetails('look');
    }

    // 查看详情
    function transferPlan(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/transfers.html',
            size: 'lg',
            controller: 'AdjustTransfersCtrl',
            scope: $scope,
            resolve: {
                billCode: function () {
                    return dataItem.sourceCode;
                }
            }
        });
    }

    // 加载出库单详情
    function loadBillDetails(type) {

        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/details.html',
            size: 'lg',
            scope: $scope,
            controller: 'AdjustDetailsCtrl',
            resolve: {
                params: {
                    type: 'look',
                    billCode: '123123'
                }
            }
        });
    }
});