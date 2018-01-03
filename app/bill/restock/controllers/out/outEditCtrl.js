'use strict';

angular.module('app').controller('outEditCtrl', function ($scope, $uibModal) {
    $scope.params = {};
    $scope.tmp = 0;

    $scope.MaterialGrid = {
        primaryId: 'code',
        kendoSetting: {
            columns: [
                {field: "materialName", title: "原料名称"},
                {field: "materialCode", title: "原料编码"},
                {field: "pickNumber", title: "应拣数量"},
                {field: "pick", title: "实拣数量"},
                {field: "progress", title: "完成度"}
            ]
        }
    };

    $scope.returnCargoGrid = {
        primaryId: 'code',
        kendoSetting: {
            autoBind: false,
            columns: [
                {command: [{name: 'select', text: "删除"}], title: "", width: 80},
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "standerUnit", title: "标准单位"},
                {field: "number", title: "规格"},
                {field: "pickNumber", title: "应拣数量"},
                {field: "pick", title: "实拣数量"},
                {field: "standardNum", title: "标准单位数量"}
            ]
        }
    };

    $scope.searchGrid = {
        kendoSetting: {
            columns: [
                {selectable: true},
                {field: "materialName", title: "货物编码"},
                {field: "materialCode", title: "货物内部名称"},
                {field: "pickNumber", title: "所属原料"},
                {field: "pick", title: "货物条码"},
                {field: "progress", title: "自定义条码"},
                {field: "progress", title: "保质期(天)"},
                {field: "progress", title: "规格"},
                {field: "progress", title: "最小标准单位"},
                {field: "progress", title: "建档时间"},
                {field: "progress", title: "备注"}
            ]
        }
    };

    $scope.returnCurrentCargoGrid = {
        primaryId: 'code',
        kendoSetting: {
            columns: [
                {command: [{name: 'select', text: "删除"}], title: "", width: 80},
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "standerUnit", title: "标准单位"},
                {field: "number", title: "规格"},
                {field: "pickNumber", title: "应拣数量"},
                {field: "pick", title: "实拣数量"},
                {field: "standardNum", title: "标准单位数量"}
            ]
        }
    };

    $scope.addCargo = function () {
        var dataSource = $scope.returnCargoGrid.kendoGrid.dataSource.data();
        editCargo(dataSource)
    }

    function editCargo(data) {
        console.log('cargo', data)
        initAddModal()
    }

    function initAddModal() {
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/add.html',
            scope: $scope,
            size: 'lg'
        })
        setTimeout(function () {
            for (var i = 0; i < $scope.returnCargoGrid.kendoGrid.dataSource._total; i++)
                $scope.returnCurrentCargoGrid.kendoGrid.dataSource.add($scope.returnCargoGrid.kendoGrid.dataSource.at(i))
        }, 100)

    }

    $scope.saveCargo = function () {
        var dataSource = $scope.returnCurrentCargoGrid.kendoGrid.dataSource.data();
        for (var i = 0; i < $scope.returnCargoGrid.kendoGrid.dataSource._total; i++)
            $scope.returnCurrentCargoGrid.kendoGrid.dataSource.remove($scope.returnCargoGrid.kendoGrid.dataSource.at(i))
        for (var i = 0; i < $scope.returnCurrentCargoGrid.kendoGrid.dataSource._total; i++)
            $scope.returnCargoGrid.kendoGrid.dataSource.add($scope.returnCurrentCargoGrid.kendoGrid.dataSource.at(i))
        $scope.addModal.close()
    }

    $scope.addCur = function () {
        $scope.returnCurrentCargoGrid.kendoGrid.dataSource.add({
            cargoName: '咖啡豆',
            cargoCode: '出库成功',
            rawMaterialId: '已提交',
            standerUnit: '审核不通过',
            number: 'htk001_stk001',
            pickNumber: 'tkckd005',
            pick: '2017-04-15',
            standardNum: '2017-04-27'
        })
    }

    $scope.outStationParams = {
        // single: true,
        callback: function (data) {
            console.log(data);
        }
    };

    $scope.addMaterial = function () {
        var dataSource = $scope.MaterialGrid.kendoGrid.dataSource;
        dataSource.add({
            code: $scope.tmp,
            billType: '退库计划转',
            outStatus: '出库成功',
            inputStatus: '已提交',
            checkStatus: '审核不通过',
            fromCode: 'htk001_stk001',
            outCode: 'tkckd005',
            recordTime: '2017-04-15',
            outTime: '2017-04-27'
        })
        $scope.tmp++;
    }

    $scope.deleteData = function () {
        var selectId = $scope.returnCargoGrid.kendoGrid.selectedKeyNames();
        var dataSource = $scope.returnCargoGrid.kendoGrid.dataSource;
        // console.log(dataSource._total)
        for (var j in selectId) {
            for (var i = 0; i < dataSource._total; i++) {
                // console.log('id', i, typeof selectId[j], typeof dataSource.at(i).code);
                if (dataSource.at(i).code.toString() === selectId[j]) {
                    // console.log('find')
                    dataSource.remove(dataSource.at(i));
                }
            }
        }
    }
});