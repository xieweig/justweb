'use strict';

angular.module('app').controller('TurnoverListCtrl', function ($scope, $uibModal) {
    $scope.params = {inStorageCode:[],outStorageCode:[]};

    // 出库站点选择
    $scope.outStationOpt = {
        callback: function (data) {
            $scope.params.outStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };
    $scope.inStationOpt = {
        callback: function (data) {
            $scope.params.inStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索
    $scope.search = function () {
        $scope.billGrid.kendoGrid.dataSource.page(1);
    };
    $scope.billGrid = {
        url: '/api/bill/mistake/findAllotByConditions',
        params: $scope.params,
        dataSource: {
            data: function () {
                return [{type: 'cargo'}, {type: 'material'}];
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {title: "操作", width: 80, command: [{name: 'look', text: "查看", click: lookDetails}]},
                {field: "xxxxx", title: "流转误差单号"},
                {field: "xxxxx", title: "调拨单号"},
                {field: "xxxxx", title: "调拨单调出库位"},
                {field: "xxxxx", title: "调拨单调入库位"},
                {field: "xxxxx", title: "入库单调出站点"},
                {field: "xxxxx", title: "入库单调入站点"},
                {field: "xxxxx", title: "调拨人"},
                {field: "xxxxx", title: "调拨时间"},
                {field: "xxxxx", title: "总误差"}
            ]
        }
    };

    function lookDetails(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/mistake/modals/turnoverDetails.html',
            size: 'lg',
            controller: 'BillDetailsCtrl',
            resolve: {
                params: {
                    type: dataItem.type
                }
            }
        });
    }
});