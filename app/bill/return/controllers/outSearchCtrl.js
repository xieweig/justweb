'use strict';

angular.module('app').controller('outSearchCtrl', function ($scope) {
    $scope.params = {};
    $scope.tmp = 0;

    $scope.returnCargoGrid = {
        primaryId: 'code',
        kendoSetting: {
            // selectable: 'multiple, row',
            autoBind: false,
            persistSelection: true,
            editable: true,
            pageable: true,
            columns: [
                // {selectable: true},
                {
                    command: [{name: 's', text: "查看"}, {name: 'e', text: "修改"}, {name: 't', text: "审核"}],
                    title: "操作",
                    width: 153
                },
                {field: "billType", title: "单据属性", width: 80},
                {field: "outStatus", title: "出库状态", width: 70},
                {field: "inputStatus", title: "提交状态", width: 70},
                {field: "checkStatus", title: "审核状态", width: 80},
                {field: "fromCode", title: "来源单号", width: 150},
                {field: "outCode", title: "出库单号", width: 100},
                {field: "recordTime", title: "录单时间"},
                {field: "outTime", title: "出库时间"}
            ]
        }
    }
    ;


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