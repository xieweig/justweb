'use strict';

angular.module('app').controller('TransferViewModalCtrl', function ($scope, ApiService, data) {
    $scope.params = {};

    $scope.modalType = data.type || 'view';


    // 请求页面数据
    ApiService.get('http://localhost:5000/api/bill/restock/findPlanOne?id=' + data.number, {hasHost: true}).then(function (response) {
        if (response.code === '000') {
            var res = response.result.content[0];
            $scope.params.billCode = res.billCode;
            $scope.params.remarks = res.remarks;
            $scope.params.recordTime = res.recordTime;
            $scope.params.outStationName = res.outStationName;
            $scope.params.inStationName = res.inStationName;

            var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
            // for (var i in res.cargoList) {
            //     dataSource.add({
            //         code: i,
            //         cargoName: res.cargoList[i].cargoName,
            //         cargoCode: res.cargoList[i].cargoCode,
            //         rawMaterialId: res.cargoList[i].rawMaterialId,
            //         number: res.cargoList[i].number,
            //         standardUnitCode: "克",
            //         pickNumber: res.cargoList[i].pickNumber
            //     })
            // }
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError);

    // 预先请求站点退库计划数据
    $scope.cargoGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            editable: true,
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "standardUnitCode", title: "标准单位"},
                // {field: "number", title: "规格"},
                {title: "规格", template: "#: number #/#: standardUnitCode #"},
                {field: "inNumber", title: "入库数量"},
                {field: "standardUnitNumber", title: "入库标准单位数量"},
                {field: "realNumber", title: "实调数量", editable: true}
            ]
        }
    };

    setTimeout(function () {
        $scope.cargoGrid.kendoGrid.dataSource.add({
            "cargoName": "货物",
            "cargoCode": "hw001",
            "rawMaterialId": "",
            "number": 500,
            "standardUnitCode": "克",
            "inNumber": 500,
            "standardUnitNumber": 10000,
            "realNumber": 100
        })
    }, 100)

    // 导出
    $scope.export = function () {
        alert('export')
    };

    // 调拨
    $scope.transfer = function () {

    }
});