'use strict';

angular.module('app').controller('PlanSearchCtrl', function ($scope, $state) {
    // 查询站点退库计划
    $scope.params = {};

    // 搜索
    $scope.search = function () {
        $scope.stationGrid.kendoGrid.dataSource.page(1);
    };

    // 初始化计划列表
    $scope.stationGrid = {
        primaryId: 'id',
        url: 'api/bill/restock/findPlanByCondition',
        params: $scope.params,
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {command: [{name: 'select', text: "拣货", click: jumpToPick}], title: "操作", width: 80},
                {field: "completionRate", title: "完成率", width: 60},
                {
                    field: "stationPlanNum", title: "站点计划号", template: function (data) {
                        return '<a href="#" class="plan-btn-group">' + data.stationPlanNum + '</a>';
                    }
                },
                {field: "recordTime", title: "录单时间", width: 90},
                {field: "recordPerson", title: "录单人", width: 60},
                {field: "outStationName", title: "出库站点"},
                {field: "inStationName", title: "调入站点"},
                {field: "quantity", title: "数量", width: 60},
                {field: "specName", title: "规格品种"},
                {field: "remarks", title: "备注"}
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
        $state.go('app.bill.restock.stationPick', {pickId: dataItem.id})
    }

    // 站点计划号跳转
    $('#grid').on('click', '.plan-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.stationGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $state.go('app.bill.restock.planView', {planId: dataItem.stationPlanNum})
    });

    // 重置表格
    $scope.reset = function () {
        $scope.params = {};
        var dataSource = $scope.stationGrid.kendoGrid.dataSource;
        var length = dataSource._total;
        for (var i = 0; i < length; i++) {
            dataSource.remove(dataSource.at(0))
        }
    };

    // 添加虚拟数据
    setTimeout(function () {
        var dataSource = $scope.stationGrid.kendoGrid.dataSource;
        dataSource.add({
            id: '123123',
            completionRate: '100%',
            stationPlanNum: 'htk001_stk002',
            recordTime: '2017-04-08',
            recordPerson: '周强',
            outStationName: '重庆西城店',
            inStationName: '重庆物流',
            quantity: '10',
            specName: '8',
            remarks: '无'
        });
        dataSource.add({
            id: '123123',
            completionRate: '100%',
            stationPlanNum: 'htk001_stk002',
            recordTime: '2017-04-08',
            recordPerson: '周强',
            outStationName: '重庆西城店',
            inStationName: '重庆物流',
            quantity: '10',
            specName: '8',
            remarks: '无'
        })
    }, 100);

});