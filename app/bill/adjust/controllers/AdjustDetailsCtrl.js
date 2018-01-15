'use strict';

angular.module('app').controller('AdjustDetailsCtrl', function ($scope, params) {
    $scope.planDetails = {type: params.type};
    if (params.billCode) {
        $scope.billCode = params.billCode;
    }

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
});