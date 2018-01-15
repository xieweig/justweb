'use strict';

angular.module('app').controller('AdjustPickCtrl', function ($scope, $uibModal, $timeout, ApiService) {
    $scope.params = {};
    // 搜索条件中的出库站点选择
    $scope.outStationParams = {
        single: true,
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索条件中的入库站点选择
    $scope.inStationParams = {
        single: true,
        callback: function (data) {
            $scope.params.outStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索
    $scope.search = function () {
        $scope.planGrid.kendoGrid.dataSource.page(1);
    };

    $scope.planGrid = {
        url: '/api/bill/waybill/findWayBillByConditions',
        params: $scope.params,
        dataSource: {
            data: function () {
                return [{}, {}];
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {selectable: true},
                {field: "xxxxx", title: "货物名称", width: 120},
                {field: "xxxxx", title: "货物编码", width: 120},
                {field: "xxxxx", title: "所属原料", width: 120},
                {field: "xxxxx", title: "货物数量", width: 120},
                {field: "xxxxx", title: "货物规格", width: 120},
                {field: "xxxxx", title: "标准单位数量", width: 120},
                {field: "xxxxx", title: "标准单位", width: 120},
                {field: "xxxxx", title: "备注", width: 120}
            ]
        }
    };

    $scope.addCargo = function () {

    }
});