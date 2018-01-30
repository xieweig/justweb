'use strict';

angular.module('app').controller('TurnoverDetailsCtrl', function ($scope, params) {
    (function () {
        if (!params.billCode) {
            swal('没有单号', '', 'warning');
            $scope.$close();
            return;
        }
        ApiService.get('/api/bill/mistake/findAllotByBillCode?billCode=' + params.billCode).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                initGrid(response.result.bill);
            }
        });
    }());

    function initGrid(billDetails) {
        $scope.billDetails = billDetails;
        var dataSource = [];
        $scope.detailsGrid = {
            kendoSetting: {
                dataSource: dataSource,
                columns: [
                    {field: "cargoName", title: "货物名称"},
                    {field: "cargoName", title: "货物编码", width: 120},
                    {field: "rawMaterialName", title: "所属原料", width: 120},
                    {field: "standardUnitName", title: "标准单位", width: 120},
                    {title: "规格", width: 120, template: '#: data.number + data.measurementName #'},
                    {field: "xxxxx", title: "调拨数量", width: 120},
                    {
                        title: "调拨标准单位数量", width: 120,
                        template: function (dataItem) {
                            return dataItem.number * 10;
                        }
                    },
                    {field: "xxxxx", title: "实调数量", width: 120},
                    {
                        title: "货物误差", width: 120,
                        template: function (dataItem) {
                            return dataItem.xxxx - dataItem.xxxx;
                        }
                    },
                    {
                        field: "xxxxx", title: "原料误差", width: 120,
                        template: function (dataItem) {
                            return (dataItem.xxxx - dataItem.xxxx) * 10;
                        }
                    }
                ]
            }
        };
    }

});