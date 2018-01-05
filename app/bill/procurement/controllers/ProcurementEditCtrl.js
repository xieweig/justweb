'use strict';

angular.module('app').controller('ProcurementEditCtrl', function ($scope, $uibModal, $timeout, params) {
    // 页面类型 查看or审核
    $scope.type = params.type;
    $scope.bill = params.purchaseBill;

    $timeout(function () {
        $('#inStorageCode').val(params.purchaseBill.inStorageCode).trigger('change');
    });

    $scope.procurementGrid = {
        primaryId: 'a',
        kendoSetting: {
            editable: 'inline',
            persistSelection: true,
            dataSource: params.purchaseBill.billDetails,
            columns: [
                { selectable: true, locked: true },
                { title: "操作", width: 160, locked: true, command: [{ name: 'edit', text: "编辑" }] },
                { field: "cargo.cargoName", title: "货物名称", width: 120 },
                { field: "cargo.cargoCode", title: "货物编码", width: 120 },
                { field: "cargo.rawMaterialId", title: "所属原料", width: 120 },
                { field: "cargo.measurementCode", title: "标准单位", width: 120 },
                { template: "#: cargo.number #/#: cargo.standardUnitCode #", title: "规格", width: 120 },
                { field: "dateInProduced", title: "生产日期", width: 160, editable: true },
                { field: "unitPrice", title: "单位进价", width: 120, type: 'number', editable: true },
                { field: "amount", title: "实收数量", width: 120, type: 'number', editable: true },
                { field: "shippedNumber", title: "发货数量", width: 120, type: 'number', editable: true },
                { field: "differenceNumber", title: "数量差额", width: 120 },
                { field: "differencePrice", title: "总价差值", width: 120 }
            ],
            save: function (e) {
                // 计算数量差额和总价值差
                var model = e.model;
                model.shippedNumber = parseInt(model.shippedNumber);
                model.amount = parseInt(model.amount);
                model.differenceNumber = model.shippedNumber - model.amount;
                model.differencePrice = (parseFloat(model.unitPrice) * model.differenceNumber).toFixed(2);
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

    // 弹出增加货物
    $scope.openAddCargoModal = function () {
        $scope.currentCargo = {};
        $uibModal.open({
            templateUrl: 'app/bill/common/modals/addCargoModal.html',
            size: 'lg',
            controller: 'AddCargoModalCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        console.log(data);
                    }
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