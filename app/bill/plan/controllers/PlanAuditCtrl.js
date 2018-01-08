'use strict';

angular.module('app').controller('PlanAuditCtrl', function ($scope, ApiService, params) {
    $scope.type = params.type;

    ApiService.get('/api/bill/planBill/hq/findByBillCode?billCode=' + params.billCode).then(function (response) {
        if (response.code !== '000') {
            swal('', response.message, 'error');
        } else {
            $scope.plan = response.result.planBill;
        }
    });

    $scope.itemMap = [{
        unfurled: false,
        cargo: {},
        stationGrid: {
            primaryId: 'stationCode',
            params: $scope.kendoQueryCondition,
            kendoSetting: {
                height: 150,
                editable: true,
                autoBind: false,
                columns: [
                    { field: "inStationName", title: "调出站点" },
                    { field: "outStationName", title: "调入站点" },
                    {
                        field: "outStationName", title: "调入站点", template: function () {
                            return '<a class="kendo-btn-a"></a>';
                        }
                    },
                    { field: "number", title: "调剂数量(点击修改)", editable: true }
                ]
            }
        }
    }, {
        unfurled: false,
        material: {},
        stationGrid: {
            primaryId: 'stationCode',
            params: $scope.kendoQueryCondition,
            kendoSetting: {
                height: 150,
                editable: true,
                autoBind: false,
                columns: [
                    { field: "inStationName", title: "调出站点" },
                    { field: "outStationName", title: "调入站点" },
                    {
                        field: "outStationName", title: "调入站点", template: function () {
                            return '<a class="kendo-btn-a"></a>';
                        }
                    },
                    { field: "number", title: "调剂数量(点击修改)", editable: true }
                ]
            }
        }
    }];

    // 伸缩项
    $scope.scaling = function (index) {
        $scope.itemMap[index].unfurled = !$scope.itemMap[index].unfurled;
    };

    $scope.auditBill = function (pass) {
        var url = '';
        if (pass) {
            url = '/api/bill/planBill/pass';
        } else {
            url = '/api/bill/planBill/unpass';
        }
        var params = {
            billCode: params.billCode,
            auditMemo: $scope.auditMemo
        };
        ApiService.post(url, params).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {

            }
        }, apiServiceError);
    };
});