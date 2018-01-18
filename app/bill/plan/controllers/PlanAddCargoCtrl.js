'use strict';

angular.module('app').controller('PlanAddCargoCtrl', function ($scope, $timeout, cb, cargoUnit, materialUnit) {
    $scope.cargoConfigure = cargoUnit;
    $scope.search = function () {
        $scope.cargoGrid.kendoGrid.dataSource.page(1);
    };

    // 原料配置
    $scope.materialParamOpt = {
        type: 'material',
        hasChildren: true,
        callback: function (data) {
            $scope.params.rawMaterialId = _.chain(data).map(function (item) {
                return item.id;
            }).join().value();
        }
    };

    $scope.params = {};
    $scope.cargoGrid = {
        params: $scope.params,
        url: COMMON_URL.baseInfo + '/api/v1/baseInfo/cargo/findByCondition',
        kendoSetting: {
            pageable: true,
            columns: [
                {command: [{name: 'add', text: "选择", click: addCargo}], title: "操作", width: 85},
                {field: "cargoCode", title: "货物编码", width: 150},
                {field: "cargoName", title: "货物商品名称", width: 150},
                {field: "originalName", title: "货物内部名称", width: 150},
                {field: "rawMaterialName", title: "所属原料", width: 150},
                {field: "barCode", title: "货物条码", width: 150},
                {field: "selfBarCode", title: "自定义条码", width: 150},
                {field: "effectiveTime", title: "保质期", width: 150},
                {
                    field: "number", title: "规格", template: function (data) {
                    return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                }, width: 150
                },
                {
                    title: "最小标准单位", width: 150, template: function (data) {
                    return getTextByVal(materialUnit, data.standardUnitCode);
                }
                },
                {field: "createTime", title: "建档时间", format: '{0: yyyy-MM-dd HH:mm}', width: 145},
                {field: "memo", title: "备注", width: 200}
            ]
        }
    };

    // 添加货物
    function addCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        cb({
            "createTime": dataItem.createTime,
            "updateTime": dataItem.updateTime,
            "logicStatus": dataItem.logicStatus,
            "cargoId": dataItem.cargoId,
            "cargoCode": dataItem.cargoCode,
            "barCode": dataItem.barCode,
            "selfBarCode": dataItem.selfBarCode,
            "originalName": dataItem.originalName,
            "cargoName": dataItem.cargoName,
            "effectiveTime": dataItem.effectiveTime,
            "measurementCode": dataItem.measurementCode,
            "measurementName": getTextByVal(cargoUnit, dataItem.measurementCode),
            "standardUnitCode": dataItem.standardUnitCode,
            "memo": dataItem.memo,
            "number": dataItem.number,
            "rawMaterialId": dataItem.rawMaterialId,
            "cargoType": dataItem.cargoType,
            "rawMaterialName": dataItem.rawMaterialName,
            "rawMaterialTypeName": dataItem.rawMaterialTypeName
        });
        $scope.$close();
    }
});