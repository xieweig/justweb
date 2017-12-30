'use strict';

angular.module('app').controller('PlanViewCtrl', function ($scope, $stateParams, ApiService) {
    $scope.params = {};

    // 预先请求站点退库计划数据
    ApiService.get('/api/bill/restock/findPlanOne?id=' + $stateParams.planId).then(function () {

    });

    $scope.cargoGrid = {
        kendoSetting: {
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "number", title: "规格"},
                {field: "pickNumber", title: "应拣数量"}
            ]
        }
    };

    setTimeout(function () {
        var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
        dataSource.add({
            cargoName: '咖啡豆',
            cargoCode: 'hw001',
            rawMaterialId: '咖啡豆',
            number: '500g/包',
            pickNumber: '20'
        })
        dataSource.add({
            cargoName: '咖啡豆',
            cargoCode: 'hw001',
            rawMaterialId: '咖啡豆',
            number: '500g/包',
            pickNumber: '20'
        })
    }, 100)

    // 导出
    $scope.export = function () {
        alert('export')
    }

    // 返回
    $scope.back = function () {
        window.history.back()
    }
});