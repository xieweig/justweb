'use strict';

angular.module('app').controller('MistakeListCtrl', function ($scope, $uibModal, $stateParams) {
    $scope.typeName = $stateParams.typeName;
    $scope.params = {};

    // 出库站点选择
    $scope.overflowStation = {
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索
    $scope.search = function () {
        $scope.billGrid.kendoGrid.dataSource.page(1);
    };
    $scope.billGrid = {
        url: '/api/bill/waybill/findWayBillByConditions',
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
                {field: "xxxxx", title: $stateParams.typeName + "时间"},
                {field: "xxxxx", title: $stateParams.typeName + "目标", width: 120},
                {field: "xxxxx", title: $stateParams.typeName + "站点", width: 120},
                {field: "xxxxx", title: $stateParams.typeName + "库位", width: 120},
                {field: "xxxxx", title: $stateParams.typeName + "操作人", width: 120}
            ]
        }
    };

    function lookDetails(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/mistake/modals/billDetailsModal.html',
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