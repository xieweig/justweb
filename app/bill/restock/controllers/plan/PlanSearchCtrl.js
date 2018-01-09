'use strict';

angular.module('app').controller('PlanSearchCtrl', function ($scope, $rootScope, $state, $uibModal) {
    // 查询站点退库计划
    $scope.params = {};

    // 搜索
    $scope.search = function () {
        $scope.stationGrid.kendoGrid.dataSource.page(1);
    };

    // 初始化计划列表
    $scope.stationGrid = {
        primaryId: 'billCode',
        url: '/api/bill/restock/findPlanBillByConditions',
        params: $scope.params,
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {
                    command: [{
                        name: 'select', text: "拣货", click: jumpToPick, visible: function (data) {
                            return data.billState === 'SAVED';
                        }
                    }], title: "操作", width: 80
                },
                {
                    field: "completionRate", title: "完成率", width: 60, template: function (data) {
                        return '<a href="#" class="rate-btn-group">' + data.progress || 0 + '%</a>';
                    }
                },
                {
                    field: "billCode", title: "站点计划号", template: function (data) {
                        return '<a href="#" class="plan-btn-group">' + data.billCode + '</a>';
                    }
                },
                {field: "createTime", title: "录单时间", width: 90},
                {field: "operatorName", title: "录单人", width: 60},
                {
                    field: "outStationCode", title: "出库站点", template: function (data) {
                        var name = '';
                        _.each($rootScope.location, function (item) {
                            if (item.value === data.outStationCode) {
                                name = item.text
                            }
                        });
                        return name
                    }
                }, // 需要改为名称
                {
                    field: "inStationCode", title: "调入站点", template: function (data) {
                        var name = '';
                        _.each($rootScope.location, function (item) {
                            if (item.value === data.inStationCode) {
                                name = item.text
                            }
                        })
                        return name
                    }
                }, // 需要改为名称
                {field: "totalAmount", title: "数量", width: 60},
                {field: "typeAmount", title: "规格品种"},
                {field: "memo", title: "备注"}
            ]
        }
    };

    // 选择站点
    $scope.inStationParams = {
        // single: true,
        callback: function (data) {
            $scope.params.inStationCodeArray = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    $scope.outStationParams = {
        // single: true,
        callback: function (data) {
            $scope.params.outStationCodeArray = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 拣货跳转
    function jumpToPick(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        console.log(dataItem);
        $state.go('app.bill.restock.stationPick', {pickId: dataItem.billCode})
    }

    // 站点计划号跳转
    var grid = $('#grid');
    grid.on('click', '.plan-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.stationGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/planView.html',
            size: 'lg',
            controller: 'PlanViewModalCtrl',
            resolve: {
                data: {
                    billCode: dataItem.billCode
                }
            }
        })
    });

    // 完成率跳转到出库单
    grid.on('click', '.rate-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.stationGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $state.go('app.bill.restock.outView', {planId: dataItem.receiveCode})
    });

    // 重置表格
    $scope.reset = function () {
        $scope.params = {};
        $scope.stationGrid.kendoGrid.dataSource.data([])
    };

});