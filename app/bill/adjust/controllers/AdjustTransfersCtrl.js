'use strict';

angular.module('app').controller('AdjustTransfersCtrl', function ($scope) {
    $scope.detailsGrid = {
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
    }
});