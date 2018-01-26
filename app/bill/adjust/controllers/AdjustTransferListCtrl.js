'use strict';

angular.module('app').controller('AdjustTransferListCtrl', function ($scope, $timeout, $uibModal) {
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

    $scope.search = function () {
        $scope.billGrid.kendoGrid.dataSource.page(1);
    };
    $scope.billGrid = {
        params: $scope.params,
        url: '/api/bill/adjust/findAllotByConditions',
        kendoSetting: {
            pageable: true,
            columns: [
                {title: '操作', command: [{name: 'l', text: "查看", click: lookDetails}], width: 80},
                {title: "来源单号", width: 120, template: '<span class="kendo-link showSourceBill" sourceCode="#: data.a #">#: data.a #</span>'},
                {field: "xxxxx", title: "调拨单号", width: 120},
                {field: "xxxxx", title: "单据属性", width: 120},
                {field: "xxxxx", title: "调拨时间", width: 120},
                {field: "xxxxx", title: "操作人", width: 120},
                {field: "xxxxx", title: "入库单出库站点", width: 120},
                {field: "xxxxx", title: "入库单入库站点", width: 120},
                {field: "xxxxx", title: "调拨单调出库位", width: 120},
                {field: "xxxxx", title: "调拨单调入库位", width: 120},
                {field: "xxxxx", title: "调拨数量", width: 120},
                {field: "xxxxx", title: "调拨品种", width: 120},
                {field: "xxxxx", title: "总进价", width: 120}
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
                        type: 'inLook',
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
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/transfers.html',
            size: 'lg',
            controller: 'AdjustTransfersCtrl',
            scope: $scope,
            resolve: {
                billCode: function () {
                    return '123123'
                }
            }
        })
        ;
    }
});