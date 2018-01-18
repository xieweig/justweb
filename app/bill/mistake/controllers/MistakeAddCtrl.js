'use strict';

angular.module('app').controller('MistakeAddCtrl', function ($scope, $stateParams, $uibModal) {
    $scope.typeName = $stateParams.typeName;

    $scope.stationOpt = {
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 原料表
    $scope.materialGrid = {
        dataSource: {
            data: function () {
                return [{type: 'cargo'}, {type: 'material'}];
            }
        },
        kendoSetting: {
            columns: [
                // {title: "操作", width: 80, command: [{name: 'look', text: "查看", click: lookDetails}]},
                {field: "xxxxx", title: "原料编码"},
                {field: "xxxxx", title: "原料名称", width: 120},
                {field: "xxxxx", title: "原料所属分类", width: 120},
                {field: "xxxxx", title: "报溢数量", width: 120},
                {field: "xxxxx", title: "标准单位", width: 120}
            ]
        }
    };

    // 货物表
    $scope.cargoGrid = {
        dataSource: {
            data: function () {
                return [{type: 'cargo'}, {type: 'material'}];
            }
        },
        kendoSetting: {
            columns: [
                // {title: "操作", width: 80, command: [{name: 'look', text: "查看", click: lookDetails}]},
                {field: "xxxxx", title: "货物名称"},
                {field: "xxxxx", title: "货物编码", width: 120},
                {field: "xxxxx", title: "所属原料", width: 120},
                {field: "xxxxx", title: "规格", width: 120},
                {field: "xxxxx", title: "货物数量", width: 120}
            ]
        }
    };
});