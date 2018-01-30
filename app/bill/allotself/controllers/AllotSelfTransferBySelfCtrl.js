'use strict';

angular.module('app').controller('AllotSelfTransferBySelfCtrl', function ($scope, $state, $uibModal, $timeout, ApiService, Common, cargoUnit, materialUnit) {
    $scope.params = {};

    // 按货物
    $scope.cargoGrid = {
        primaryIf: 'cargoCode',
        kendoSetting: {
            autoBind: false,
            persistSelection: true,
            editable: true,
            columns: [
                {selectable: true},
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialName", title: "所属原料"},
                {field: "actualAmount", title: "货物数量"}, // 对应添加货物的实拣数量
                {
                    title: "货物规格", template: function (data) {
                        return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                    }
                },
                {
                    title: "标准单位数量", template: function (data) {
                        return data.number * data.actualAmount
                    }
                },
                {
                    field: "standardUnitCode", title: "标准单位", template: function (data) {
                        return getTextByVal($scope.materialConfigure, data.standardUnitCode);
                    }
                },
                {field: "memo", title: "备注"}
            ]
        }
    };

    $scope.addCargo = function () {
        // var dataSource = $scope.cargoListGrid.kendoGrid.dataSource;
        $scope.cargoModal = $uibModal.open({
            templateUrl: 'app/bill/common/modals/addCargoWithMaterial.html',
            size: 'lg',
            controller: 'AddCargoWithMaterialCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        $scope.cargoList = data;
                        var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
                        dataSource.data([]);
                        for (var i = 0; i < data.length; i++) {
                            dataSource.add(data[i])
                        }
                        $scope.cargoModal.close()
                    }
                },
                data: {
                    cl: $scope.cargoGrid.kendoGrid.dataSource.data(),
                    cargoUnit: $scope.cargoConfigure,
                    materialUnit: $scope.materialConfigure
                },
                form: function () {
                    return _.map($scope.cargoGrid.kendoGrid.dataSource.data(), function (item) {
                        return combinationItem(item);
                    })
                }
            }
        });
    };

    function combinationItem(item) {
        return {
            "createTime": item.createTime,
            "updateTime": item.updateTime,
            "cargoId": item.cargoId,
            "cargoCode": item.cargoCode,
            "barCode": item.barCode,
            "selfBarCode": item.selfBarCode,
            "originalName": item.originalName,
            "cargoName": item.cargoName,
            "effectiveTime": item.effectiveTime,
            "measurementCode": item.measurementCode,
            "standardUnitCode": item.standardUnitCode,
            "memo": item.memo,
            "number": item.number,
            "rawMaterialId": item.rawMaterialId,
            "operatorCode": item.operatorCode,
            "cargoType": item.cargoType,
            "rawMaterialName": item.rawMaterialName,
            "rawMaterialCode": item.rawMaterialCode,
            "configureName": item.configureName,
            "dateInProduced": item.dateInProduced,
            "unitPrice": item.unitPrice,
            "actualAmount": item.actualAmount,
            "shippedAmount": item.shippedAmount,
        };
    }

    $scope.delCargo = function () {
        var grid = $scope.cargoListGrid.kendoGrid;
        var selectId = grid.selectedKeyNames();
        var dataSource = grid.dataSource;
        for (var j in selectId) {
            for (var i = 0; i < dataSource._total; i++) {
                if (dataSource.at(i).cargoCode.toString() === selectId[j]) {
                    dataSource.remove(dataSource.at(i));
                }
            }
        }
        grid._selectedIds = {};
        grid.clearSelection();
        if (selectId.length !== 0) {
            swal('删除成功', '', 'success')
        } else {
            swal('请选择要批量删除的货物', '', 'warning')
        }
        grid.refresh();
    };

    // 按原料
    $scope.materialGrid = {
        primaryIf: 'cargoCode',
        kendoSetting: {
            autoBind: false,
            persistSelection: true,
            editable: true,
            columns: [
                {selectable: true},
                {field: "materialName", title: "原料名称"},
                {field: "materialCode", title: "原料编码"},
                {
                    title: "标准单位", template: function (data) {
                        return getTextByVal($scope.materialConfigure, data.standardUnitCode);
                    }
                },
                {
                    title: "数量", template: function (data) {
                        return data.number
                    }
                },
                {field: "memo", title: "备注"}
            ]
        }
    };

    $scope.addMaterial = function () {
        // var dataSource = $scope.cargoListGrid.kendoGrid.dataSource;
        $uibModal.open({
            templateUrl: 'app/bill/allotself/modals/materialModal.html',
            size: 'xs',
            controller: 'AllotSelfMaterialModalCtrl'
        });
    };
});
