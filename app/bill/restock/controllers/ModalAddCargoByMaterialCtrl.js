'use strict';

angular.module('app').controller('ModalAddCargoByMaterialCtrl', function ($scope) {
    // 拣货的添加货物
    $scope.params = {};

    // 查询结果表格
    $scope.searchGrid = {
        kendoSetting: {
            columns: [
                {selectable: "cell"},
                {field: "cargoCode", title: "货物编码"},
                {field: "cargoInternalCode", title: "货物内部名称"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "cargoBarcode", title: "货物条码"},
                {field: "customBarcode", title: "自定义条码"},
                {field: "expireDay", title: "保质期(天)"},
                {field: "number", title: "规格"},
                {field: "minStandardUnit", title: "最小标准单位"},
                {field: "createdTime", title: "建档时间"},
                {field: "remarks", title: "备注"}
            ]
        }
    };

    // 已选中货物表格
    $scope.currentCargoGrid = {
        kendoSetting: {
            columns: [
                {command: [{name: 'select', text: "删除"}], title: "", width: 80},
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "standardUnit", title: "标准单位"},
                {field: "number", title: "规格"},
                {field: "cargoNumber", title: "货物数量"}
            ]
        }
    };

    setTimeout(function () {
        for (var i = 0; i < $scope.itemMap[$scope.index].cargoGrid.kendoGrid.dataSource._total; i++)
            $scope.currentCargoGrid.kendoGrid.dataSource.add($scope.itemMap[$scope.index].cargoGrid.kendoGrid.dataSource.at(i))
    }, 100)

    // 保存货物
    $scope.saveCargo = function () {
        var data = $scope.itemMap[$scope.index].cargoGrid.kendoGrid.dataSource;
        var dataSource = $scope.currentCargoGrid.kendoGrid.dataSource;
        for (var i = 0; i < data._total; i++) {
            dataSource.remove(data.at(i))
        }
        for (var i = 0; i < dataSource._total; i++) {
            data.add(dataSource.at(i))
        }
        $scope.addModal.close()
    };

    // 删除货物
    $scope.delCargo = function () {
        var selectId = $scope.returnCargoGrid.kendoGrid.selectedKeyNames();
        var dataSource = $scope.returnCargoGrid.kendoGrid.dataSource;
        for (var j in selectId) {
            for (var i = 0; i < dataSource._total; i++) {
                if (dataSource.at(i).code.toString() === selectId[j]) {
                    dataSource.remove(dataSource.at(i));
                }
            }
        }
    };

    // 测试用 之后删除  TODO:如果一条直接添加进当前选中货物
    $scope.addSearch = function () {
        $scope.searchGrid.kendoGrid.dataSource.add({
            cargoCode: "货物编码",
            cargoInternalCode: "货物内部名称",
            rawMaterialId: "所属原料",
            cargoBarcode: "货物条码",
            customBarcode: "自定义条码",
            expireDay: "保质期(天)",
            number: "规格",
            minStandardUnit: "最小标准单位",
            createdTime: "建档时间",
            remarks: "备注"
        })
    }


    $scope.addCur = function () {
        $scope.currentCargoGrid.kendoGrid.dataSource.add({
            cargoName: '咖啡豆',
            cargoCode: 'kf001',
            rawMaterialId: '已提交',
            standerUnit: '审核不通过',
            number: '500毫升/盒',
            cargoNumber: '11'
        })
    }

});