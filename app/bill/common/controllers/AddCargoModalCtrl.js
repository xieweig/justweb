'use strict';

angular.module('app').controller('AddCargoModalCtrl', function ($scope, cb) {
    $scope.params = {};
    $scope.search = function () {
        $scope.cargoList.kendoGrid.dataSource.page(1);
    };
    // 条件查询的货物列表
    $scope.cargoList = {
        url: 'http://192.168.21.191:15001/api/v1/baseInfo/cargo/findByCargoCode',
        params: $scope.params,
        kendoSetting: {
            autoBind: false,
            columns: [
                { selectable: true },
                { field: "xxxxxxxxxx", title: "货物编码", width: 120 },
                { field: "xxxxxxxxxx", title: "货物内部名称", width: 120 },
                { field: "xxxxxxxxxx", title: "所属原料", width: 120 },
                { field: "xxxxxxxxxx", title: "货物条码", width: 120 },
                { field: "xxxxxxxxxx", title: "自定义条码", width: 120 },
                { field: "xxxxxxxxxx", title: "保质期(天)", width: 120 },
                { field: "xxxxxxxxxx", title: "规格", width: 120 },
                { field: "xxxxxxxxxx", title: "最小标准单位", width: 120 },
                { field: "xxxxxxxxxx", title: "建档时间", width: 120 },
                { field: "xxxxxxxxxx", title: "备注", width: 200 }
            ]
        }
    };

    // 已选中货物列表
    $scope.currentCargoList = {
        kendoSetting: {
            columns: [
                { title: "操作", locked: true, command: [{ name: 'delete', text: "删除" }], width: 80 },
                { field: "xxxxxxxxxx", title: "货物编码", width: 120 },
                { field: "xxxxxxxxxx", title: "货物内部名称", width: 120 },
                { field: "xxxxxxxxxx", title: "所属原料", width: 120 },
                { field: "xxxxxxxxxx", title: "货物条码", width: 120 },
                { field: "xxxxxxxxxx", title: "自定义条码", width: 120 },
                { field: "xxxxxxxxxx", title: "保质期(天)", width: 120 },
                { field: "xxxxxxxxxx", title: "规格", width: 120 },
                { field: "xxxxxxxxxx", title: "最小标准单位", width: 120 },
                { field: "xxxxxxxxxx", title: "建档时间", width: 120 },
                { field: "xxxxxxxxxx", title: "备注", width: 200 }
            ]
        }
    };

    /**
     * 提交选中货物
     */
    $scope.submit = function () {
        var result = _.map($scope.currentCargoList.kendoGrid.dataSource.data(), function (item) {
            return { cargoCode: '123' };
        });
        result = [
            {
                "createTime": "2017-12-11",
                "updateTime": "2017-12-11 10:30:06",
                "logicStatus": "USABLE",
                "cargoCode": "cargoCode001",
                "barCode": "hy1234567891",
                "selfBarCode": "hy001",
                "originalName": "1级咖啡豆",
                "cargoName": "南山1级咖啡豆",
                "effectiveTime": 160,
                "measurementCode": "gg001",
                "standardUnitCode": "dw001",
                "memo": "-",
                "number": 0,
                "rawMaterialId": 111,
                "cargoType": "CONVENTION"
            }
        ];
        cb(result);
    };
});