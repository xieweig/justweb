'use strict';

angular.module('app').controller('stationPickCtrl', function ($scope, $state, $stateParams) {
    $scope.params = {};

    // console.log($stateParams.pickId)

    $scope.cargoGrid = {
        primaryId: 'cg',
        kendoSetting: {
            // autoBind: false,
            // pageable: true,
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "number", title: "规格"},
                {field: "pickNumber", title: "应拣数量"}
            ]
        }
    };

    $scope.outStationParams = {
        // single: true,
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    $scope.inStationParams = {
        // single: true,
        callback: function (data) {
            $scope.params.outStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 用于测试的添加数据 使用api server
    $scope.addaData = function () {
        var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
        dataSource.add({
            cargoName: '咖啡豆',
            cargoCode: 'hw001',
            rawMaterialId: '咖啡豆',
            number: '500g/包',
            pickNumber: '20'
        })
    }

});