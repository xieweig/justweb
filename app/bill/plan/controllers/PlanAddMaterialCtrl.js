'use strict';

angular.module('app').controller('PlanAddMaterialCtrl', function ($scope, $timeout, cb) {
    $scope.params = {};
    $scope.search = function () {
        $scope.materialGrid.kendoGrid.dataSource.page(1);
    };

    // 原料配置
    $scope.materialParamOpt = {
        type: 'material',
        callback: function (data) {
            $scope.params.materialTypeCodeArray = _.map(data, function (item) {
                return item.code;
            });
        }
    };

    $scope.materialGrid = {
        primaryId: 'materialCode',
        params: $scope.params,
        url: COMMON_URL.baseInfo + '/api/v1/baseInfo/rawMaterial/findByConditionForApi',
        kendoSetting: {
            pageable: true,
            columns: [
                {command: [{name: 'add', text: "选择", click: addMaterial}], title: "操作", width: 85},
                {field: "materialCode", title: "原料编码", width: 170},
                {field: "materialName", title: "原料名称", width: 170},
                {field: "materialTypeName", title: "原料分类", width: 170},
                {field: "materialTypeCode", title: "原料分类编码", width: 170},
                {field: "standardUnitName", title: "最小标准单位", width: 170},
                {field: "createTime", title: "建档时间", width: 170},
                {field: "operatorCode", title: "建档人", width: 170},
                {field: "memo", title: "备注", width: 200}
            ]
        }
    };

    // 添加货物
    function addMaterial(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        cb({
            "materialCode": dataItem.materialCode,
            "materialName": dataItem.materialName,
            "materialTypeName": dataItem.materialTypeName,
            "materialTypeCode": dataItem.materialTypeCode,
            "standardUnit": dataItem.standardUnit,
            "standardUnitName": dataItem.standardUnitName,
            "createTime": dataItem.createTime,
            "operatorCode": dataItem.operatorCode,
            "memo": dataItem.memo
        });
        $scope.$close();
    }

});