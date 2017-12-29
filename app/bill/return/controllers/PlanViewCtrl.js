'use strict';

angular.module('app').controller('PlanViewCtrl', function ($scope) {
    $scope.params = {};

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

});