'use strict';

angular.module('app').controller('MistakeAddCtrl', function ($scope, $stateParams, ApiService, $uibModal) {
    $scope.typeName = $stateParams.typeName;
    $scope.bill = {cargo: {}, material: {}};
    $scope.bySomething = 'cargo';

    $scope.materialStationOpt = {
        single: true,
        callback: function (data) {
            $scope.bill.material.inStationCode = data.stationCode;
        }
    };

    $scope.cargoStationOpt = {
        single: true,
        callback: function (data) {
            $scope.bill.cargo.inStationCode = data.stationCode;
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

    // 提交
    $scope.submit = function () {
        var params = {};
        var dataItem = {};
        if ($scope.bySomething === 'cargo') {
            dataItem = $scope.bill.cargo;
        } else {
            dataItem = $scope.bill.material;
        }
        params.memo = dataItem.memo;
        return
        ApiService.post('/api/bill/mistake/submitOverFlow', params).then(function () {

        });
    };
});