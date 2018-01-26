'use strict';

angular.module('app').controller('AdjustTransferListCtrl', function ($scope, $timeout, $uibModal) {
    $scope.params = {};

    // 搜索条件中的出库站点选择
    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.outStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索条件中的入库站点选择
    $scope.inStationParams = {
        callback: function (data) {
            $scope.params.inStationCodes = _.map(data, function (item) {
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
                {title: "来源单号", width: 250, template: '<a href="javascript:void(0);" class="sourceCode">#: data.sourceCode || "" #</a>'},
                {field: "billCode", title: "调拨单号", width: 250},
                {
                    title: "单据属性", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.specificBillType, data.specificBillType);
                    }
                },
                {field: "createTime", title: "调拨时间", width: 160},
                {field: "operatorName", title: "操作人", width: 120},
                {
                    title: "入库单出库站点", width: 160,
                    template: function (data) {
                        if (data.outLocation) {
                            return getTextByVal($scope.station, data.outLocation.stationCode);
                        }
                        return '';
                    }
                },
                {
                    title: "入库单入库站点", width: 160,
                    template: function (data) {
                        if (data.outLocation) {
                            return getTextByVal($scope.station, data.inLocation.stationCode);
                        }
                        return '';
                    }
                },
                {
                    title: "调拨单调出库位", width: 120,
                    template: function (data) {
                        if (data.outLocation && data.outLocation.storage) {
                            return getTextByVal($scope.outType, data.outLocation.storage.storageCode);
                        }
                        return '';
                    }
                },
                {
                    title: "调拨单调入库位", width: 120,
                    template: function (data) {
                        if (data.inLocation && data.inLocation.storage) {
                            return getTextByVal($scope.outType, data.inLocation.storage.storageCode);
                        }
                        return '';
                    }
                },
                {field: "totalAmount", title: "调拨数量", width: 120},
                {field: "totalVarietyAmount", title: "调拨品种", width: 120}
            ]
        }
    };

    // 点击来源单号的事件
    $('#billGrid').on('click', '.sourceCode', function (e) {
        var dataItem = $scope.billGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/details.html',
            size: 'lg',
            scope: $scope,
            controller: 'AdjustDetailsCtrl',
            resolve: {
                params: {
                    type: 'inLook',
                    billCode: dataItem.sourceCode
                }
            }
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
                params: {
                    billCode: dataItem.billCode,
                    sourceType: 'old'
                }
            }
        });
    }
});