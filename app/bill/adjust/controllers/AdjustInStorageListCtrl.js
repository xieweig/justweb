'use strict';

angular.module('app').controller('AdjustInStorageListCtrl', function ($scope, $state, $timeout, $uibModal, cargoUnit, materialUnit) {
    $scope.params = {sourceBillType: []};
    $scope.adjustSourceBill = [
        {key: 'ADJUST', value: 'ADJUST', text: '调剂计划'},
        {key: 'NO_PLAN', value: 'NO_PLAN', text: '无计划'}
    ];


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
    // 重置页面
    $scope.resetPage = function () {
        $state.reload($state.current.name);
    };


    $scope.search = function () {
        $scope.billGrid.kendoGrid.dataSource.page(1);
    };
    $scope.billGrid = {
        url: '/api/bill/adjust/findInStorageByConditions',
        params: $scope.params,
        dataSource: {
            parameterMap: function (data) {
                if (!data.billAllotState) {
                    data.billAllotState = null;
                }

                if (!data.inStationCodes || data.inStationCodes.length === 0) {
                    data.inStationCodes = ['USER_ALL'];
                }
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            height: 500,
            columns: [
                {
                    title: '操作',
                    locked: true,
                    command: [
                        {name: 'l', text: "查看", click: lookDetails},
                        {
                            name: 'u', text: "调拨", click: transferPlan,
                            visible: function (data) {
                                return data.allotStatus === 'NOT_ALLOT';
                            }
                        }
                    ], width: 160
                },
                {
                    title: "单据状态", width: 160,
                    template: function (data) {
                        if (data.allotStatus === 'ALLOT') {
                            return '已调拨';
                        }
                        return '未调拨';
                    }
                },
                {
                    title: "单据属性", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.sourceBillType, data.sourceBillType)
                    }
                },
                {title: "来源单号", width: 250, template: '<a href="javascript:void(0);" class="sourceCode">#: data.sourceCode || "" #</a>'},
                {field: "billCode", title: "入库单号", width: 200},
                {field: "createTime", title: "录单时间", width: 160},
                {field: "inWareHouseTime", title: "入库时间", width: 120},
                {field: "operatorName", title: "入库人", width: 120},
                {
                    title: "出库站点", width: 200,
                    template: function (data) {
                        if (data.outLocation) {
                            return getTextByVal($scope.station, data.outLocation.stationCode);
                        }
                        return '-';
                    }
                },
                {
                    title: "入库站点", width: 200,
                    template: function (data) {
                        if (data.inLocation) {
                            return getTextByVal($scope.station, data.inLocation.stationCode);
                        }
                        return '-';
                    }
                },
                {field: "totalAmount", title: "入库数量", width: 120},
                {field: "totalVarietyAmount", title: "入库品种数", width: 120}
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
                    billCode: dataItem.sourceCode,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit,
                    type: 'outLook'
                }
            }
        });
    });


    // 查看详情
    function lookDetails(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/details.html',
            size: 'lg',
            scope: $scope,
            controller: 'AdjustDetailsCtrl',
            resolve: {
                params: {
                    type: 'inLook',
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit,
                    billCode: dataItem.billCode
                }
            }
        });
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
                params: {
                    billCode: dataItem.billCode,
                    sourceType: 'new',
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit
                }
            }
        }).closed.then(function () {
            $scope.billGrid.kendoGrid.dataSource.read();
        });
    }
});