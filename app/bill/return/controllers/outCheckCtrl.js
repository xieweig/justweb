'use strict';

angular.module('app').controller('outCheckCtrl', function ($scope) {
    $scope.params = {};
    $scope.tmp = 0;

    $scope.returnMaterialGrid = {
        primaryId: 'code',
        kendoSetting: {
            // selectable: 'multiple, row',
            // autoBind: false,
            // persistSelection: true,
            // editable: true,
            // pageable: true,
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
            // selectable: 'multiple, row',
            // autoBind: false,
            // persistSelection: true,
            // editable: true,
            // pageable: true,
            columns: [
                {field: "billType", title: "货物名称"},
                {field: "outStatus", title: "货物编码"},
                {field: "inputStatus", title: "所属原料"},
                {field: "checkStatus", title: "标准单位"},
                {field: "fromCode", title: "规格"},
                {field: "outCode", title: "应拣数量"},
                {field: "recordTime", title: "实拣数量"},
                {field: "outTime", title: "标准单位数量"}
            ]
        }
    }

    $scope.outStationParams = {
        // single: true,
        callback: function (data) {
            console.log(data);
        }
    };

    $scope.addData = function () {
        var dataSource = $scope.returnCargoGrid.kendoGrid.dataSource;
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