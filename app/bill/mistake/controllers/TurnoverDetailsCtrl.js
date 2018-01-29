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
        $scope.detailsGrid = {
            kendoSetting: {
                dataSource: _.map(billDetails.billDetails, function () {

                }),
                columns: [
                    {field: "xxxxx", title: "货物名称"},
                    {field: "xxxxx", title: "货物编码", width: 120},
                    {field: "xxxxx", title: "所属原料", width: 120},
                    {field: "xxxxx", title: "规标准单位", width: 120},
                    {field: "xxxxx", title: "规格", width: 120},
                    {field: "xxxxx", title: "调拨数量", width: 120},
                    {field: "xxxxx", title: "调拨标准单位数量", width: 120},
                    {field: "xxxxx", title: "实调数量", width: 120},
                    {field: "xxxxx", title: "货物误差", width: 120},
                    {field: "xxxxx", title: "原料误差", width: 120}
                ]
            }
        };
    }

});