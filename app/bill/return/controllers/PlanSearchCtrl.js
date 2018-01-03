'use strict';

angular.module('app').controller('PlanSearchCtrl', function ($scope) {
    $scope.params = {};

    $scope.stationGrid = {
        kendoSetting: {
            columns: [
                { command: [{ name: 'select', text: "拣货" }], title: "操作", width: 80, locked: true },
                { field: "completionRate", title: "完成率", width: 60 },
                {
                    field: "stationPlanNum", title: "站点计划号", template: function (data) {
                        return data.stationPlanNum;
                    }
                },
                { field: "recordTime", title: "录单时间", width: 90 },
                { field: "recordPerson", title: "录单人", width: 60 },
                { field: "outStationName", title: "出库站点" },
                { field: "inStationName", title: "调入站点" },
                { field: "quantity", title: "数量", width: 60 },
                { field: "specName", title: "规格品种" },
                { field: "remarks", title: "备注" }
            ]
        }
    };

    // 添加虚拟数据
    setTimeout(function () {
        var dataSource = $scope.stationGrid.kendoGrid.dataSource;
        dataSource.add({
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
        dataSource.add({
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

    $scope.outStationParams = {
        // single: true,
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };
});