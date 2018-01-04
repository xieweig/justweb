'use strict';

angular.module('app').controller('PlanAddCargoCtrl', function ($scope, $timeout, cb) {
    $scope.cargoConfigure = [{ text: '123' }];
    $scope.cargoGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            height: 150,
            editable: true,
            columns: [
                { selectable: true },
                { field: "cargoCode", title: "货物编码", width: 150 },
                { field: "cargoName", title: "货物商品名称", width: 150 },
                { field: "originalName", title: "货物内部名称", width: 150 },
                { field: "rawMaterialName", title: "所属原料", width: 150 },
                { field: "barCode", title: "货物条码", width: 150 },
                { field: "selfBarCode", title: "自定义条码", width: 150 },
                { field: "effectiveTime", title: "保质期", width: 150 },
                { field: "number", title: "规格", template: function (data) { return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode) }, width: 150 },
                { title: "最小标准单位", width: 150, template: function (data) { return getTextByVal($scope.materialConfigure, data.standardUnitCode); } },
                { field: "createTime", title: "建档时间", format: '{0: yyyy-MM-dd HH:mm}', width: 145 },
                { field: "memo", title: "备注", width: 200 }
            ]
        }
    };

    // 添加货物
    $scope.addCargo = function () {
        $scope.$close();
        cb({ cargoCode: '213' });
    };
});