'use strict';

angular.module('app').controller('TransferViewModalCtrl', function ($scope, ApiService, data) {
    $scope.params = {};

    // 请求页面数据
    ApiService.get('http://localhost:5000/api/bill/restock/findPlanOne?id=' + data.number, {hasHost: true}).then(function (response) {
        if (response.code === '000') {
            var res = response.result.content[0];
            $scope.params.billCode = res.billCode
            $scope.params.remarks = res.remarks
            $scope.params.recordTime = res.recordTime
            $scope.params.outStationName = res.outStationName
            $scope.params.inStationName = res.inStationName

            var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
            for (var i in res.cargoList) {
                dataSource.add({
                    cargoName: res.cargoList[i].cargoName,
                    cargoCode: res.cargoList[i].cargoCode,
                    rawMaterialId: res.cargoList[i].rawMaterialId,
                    number: res.cargoList[i].number,
                    pickNumber: res.cargoList[i].pickNumber
                })
            }
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError)

    // 预先请求站点退库计划数据
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

    // 导出
    $scope.export = function () {
        alert('export')
    };
});