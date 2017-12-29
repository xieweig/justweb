'use strict';

angular.module('app').controller('stationPickCtrl', function ($scope) {
    $scope.params = {};
    $scope.tmp = 0;

    $scope.returnCargoGrid = {
        primaryId: 'code',
        kendoSetting: {
            // selectable: 'multiple, row',
            autoBind: false,
            persistSelection: true,
            editable: true,
            // pageable: true,
            columns: [
                {selectable: true},
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "cargoNum", title: "货物数量"},
                {field: "standardNum", title: "标准单位数量"},
                {field: "standardUnit", title: "标准单位"},
                {field: "remarks", title: "备注"}
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
            cargoName: '咖啡豆',
            cargoCode: 'hw00'+$scope.tmp.toString(),
            rawMaterialId: '咖啡豆',
            cargoNum: 20,
            standardNum: '500g/包',
            standardUnit: 20,
            remarks: '备注'
        })
        $scope.tmp ++;
    }

    $scope.deleteData = function () {
        var selectId = $scope.returnCargoGrid.kendoGrid.selectedKeyNames();
        var dataSource = $scope.returnCargoGrid.kendoGrid.dataSource;
        // console.log(dataSource._total)
        for(var j in selectId) {
            for (var i = 0; i<dataSource._total;i++) {
                // console.log('id', i, typeof selectId[j], typeof dataSource.at(i).code);
                if (dataSource.at(i).code.toString() === selectId[j]) {
                    // console.log('find')
                    dataSource.remove(dataSource.at(i));
                }
            }
        }
    }
});