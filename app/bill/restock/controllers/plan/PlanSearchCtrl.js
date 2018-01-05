'use strict';

angular.module('app').controller('PlanSearchCtrl', function ($scope, $state, $uibModal) {
    // 查询站点退库计划
    $scope.params = {};

    // 搜索
    $scope.search = function () {
        $scope.stationGrid.kendoGrid.dataSource.page(1);
    };

    // 初始化计划列表
    $scope.stationGrid = {
        primaryId: 'billCode',
        url: 'http://localhost:5000/api/bill/restock/findPlanByCondition',
        params: $scope.params,
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {
                    command: [{
                        name: 'select', text: "拣货", click: jumpToPick, visible: function (item) {
                            return item.billState === 'SAVED';
                        }
                    }], title: "操作", width: 80
                },
                {
                    field: "completionRate", title: "完成率", width: 60, template: function (data) {
                        return '<a href="#" class="rate-btn-group">' + data.progress + '</a>';
                    }
                },
                {
                    field: "stationPlanNum", title: "站点计划号", template: function (data) {
                        return '<a href="#" class="plan-btn-group">' + data.stationPlanCode + '</a>';
                    }
                },
                {field: "createTime", title: "录单时间", width: 90},
                {field: "creatorName", title: "录单人", width: 60},
                {field: "outStation", title: "出库站点"},
                {field: "inStation", title: "调入站点"},
                {field: "amount", title: "数量", width: 60},
                {field: "species", title: "规格品种"},
                {field: "memo", title: "备注"}
            ]
        }
    };

    // 选择站点
    $scope.inStationParams = {
        // single: true,
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    $scope.outStationParams = {
        // single: true,
        callback: function (data) {
            $scope.params.outStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 拣货跳转
    function jumpToPick(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        console.log(dataItem);
        $state.go('app.bill.restock.stationPick', {pickId: dataItem.stationPlanCode})
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
                    billCode: '单号'
                }
            }
        })
    });

    // 完成率跳转到出库单
    grid.on('click', '.rate-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.stationGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $state.go('app.bill.restock.outView', {planId: dataItem.stationPlanCode})
    });

    // 重置表格
    $scope.reset = function () {
        $scope.params = {};
        $scope.stationGrid.kendoGrid.dataSource.data([])
    };

});