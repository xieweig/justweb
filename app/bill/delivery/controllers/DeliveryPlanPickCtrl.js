'use strict';

angular.module('app').controller('DeliveryPlanPickCtrl', function ($scope, $uibModal, $timeout, ApiService) {

    // 出库站点选择
    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 货物grid
    $scope.cargoGrid = {
        kendoSetting: {
            dataSource: [{xxxxx: 123, a: 123, b: 44}, {xxxxx: 123, a: 123, b: 44}],
            editable: true,
            columns: [
                {field: "xxxxx", title: "货物名称", width: 120},
                {field: "xxxxx", title: "货物编码", width: 120},
                {field: "xxxxx", title: "所属原料", width: 120},
                {field: "xxxxx", title: "规格", width: 120},
                {field: "xxxxx", title: "应拣数量", width: 120},
                {field: "b", title: "实拣数量", width: 120},
                {field: "a", title: "备注(点击编辑)", width: 120, editable: true}
            ]
        }
    };

    // 原料grid
    $scope.materialGrid = {
        kendoSetting: {
            dataSource: [{xxxxx: 123, a: 123, b: 44}, {xxxxx: 123, a: 123, b: 44}],
            editable: true,
            columns: [
                {title: "操作", width: 85, command: [{name: 'del', text: "删除", click: delCargo}]},
                {field: "xxxxx", title: "货物名称", width: 120},
                {field: "xxxxx", title: "货物编码", width: 120},
                {field: "xxxxx", title: "所属原料", width: 120},
                {field: "xxxxx", title: "规格", width: 120},
                {field: "xxxxx", title: "应拣数量", width: 120},
                {field: "b", title: "实拣数量", width: 120},
                {field: "a", title: "备注(点击编辑)", width: 120, editable: true}
            ]
        }
    };

    // 删除原料表格中的货物
    function delCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.materialGrid.kendoGrid.dataSource.remove(dataItem)
    }

    // 扫码货物
    $scope.enterCargo = function (e) {
        var keyCode = window.event.keyCode;
        if (keyCode === 13) {
            $uibModal.open({
                templateUrl: 'app/bill/delivery/modals/planPickCargo.html',
                size: 'md',
                scope: $scope
            });
        }
    };

    // 提交拣货
    $scope.submitPick = function () {

    };
});