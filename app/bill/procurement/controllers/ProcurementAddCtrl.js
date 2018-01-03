'use strict';

angular.module('app').controller('ProcurementAddCtrl', function ($scope, $stateParams, $uibModal) {
    // 页面类型 查看or审核
    $scope.type = 'add';

    $scope.procurementGrid = {
        primaryId: 'a',
        kendoSetting: {
            editable: 'inline',
            persistSelection: true,
            columns: [
                { selectable: true },
                {
                    title: "操作", width: 160, command: [{ name: 'edit', text: "编辑" }]
                },
                { field: "xxxxxxxxxx", title: "货物名称", width: 120 },
                { field: "xxxxxxxxxx", title: "货物编码", width: 120 },
                { field: "xxxxxxxxxx", title: "所属原料", width: 120 },
                { field: "xxxxxxxxxx", title: "标准单位", width: 120 },
                { field: "xxxxxxxxxx", title: "规格", width: 120 },
                { field: "time", title: "生产日期", width: 120, editable: true, WdatePicker: 'yyyy-MM-dd' },
                { field: "xxxxxxxxxx", title: "单位进价", width: 120, editable: true },
                { field: "xxxxxxxxxx", title: "实收数量", width: 120, editable: true },
                { field: "a", title: "发货数量", width: 120, editable: true },
                { field: "xxxxxxxxxx", title: "数量差额", width: 120 },
                { field: "xxxxxxxxxx", title: "总价差值", width: 120 }
            ],
            save: function (e) {
                e.model.time = new Date();
                return e;
            }
        }
    };



    // 批量删除
    $scope.batchDelete = function () {
        var selectIds = $scope.procurementGrid.kendoGrid.selectedKeyNames();
        var dataSource = $scope.procurementGrid.kendoGrid.dataSource;
        // 循环需要删除的索引的反序
        var indexPos = _.chain(dataSource.data()).map(function (item, index) {
            if (_.indexOf(selectIds, '' + item.a) > -1) {
                return index;
            }
        }).reverse().value();
        // 根据反序  从最后一条开始删除
        _.each(indexPos, function (item) {
            if (_.isNumber(item) && item >= 0) {
                dataSource.remove(dataSource.at(item));
            }
        });
    };

    // 弹出增加供应商
    $scope.openAddCargoModal = function () {
        $scope.currentCargo = {};
        $uibModal.open({
            templateUrl: 'app/bill/common/modals/addCargoModal.html',
            size: 'lg',
            controller: 'AddCargoModalCtrl',
            resolve: {
                cb: function () {
                    alert(213);
                }
            }
        });
    };

    // 增加货物
    $scope.addCargo = function () {
        addCargo($scope.currentCargo);
        $scope.addCargoModal.close();
    };

    // 增加货物
    $scope.addNextCargo = function () {
        addCargo($scope.currentCargo);
        $scope.currentCargo = {};
    };

    // 增加货物
    function addCargo(currentCargo) {
        $scope.procurementGrid.kendoGrid.dataSource.add({ a: generateMixed(10) });
    }
});