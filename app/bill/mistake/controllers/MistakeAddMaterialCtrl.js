'use strict';

angular.module('app').controller('MistakeAddMaterialCtrl', function ($scope, params) {
    $scope.params = {};
    if (!params.data) {
        params.data = [];
    }
    // 原料配置
    $scope.materialParamOpt = {
        type: 'material',
        callback: function (data) {
            $scope.params.materialTypeCodeArray = _.map(data, function (item) {
                return item.code;
            });
        }
    };

    $scope.search = function () {
        $scope.materialList.kendoGrid.dataSource.page(1);
    };
    // 条件查询的货物列表
    $scope.materialList = {
        url: COMMON_URL.baseInfo + '/api/v1/baseInfo/rawMaterial/findByConditionForApi',
        params: $scope.params,
        primaryId: 'materialCode',
        dataSource: {
            data: function (response) {
                var result = getKendoData(response);
                if (result.length === 1) {
                    $scope.addCargo(result);
                }
                return result;
            }
        },
        kendoSetting: {
            autoBind: false,
            persistSelection: true,
            pageable: true,
            height: 300,
            columns: [
                {selectable: true},
                {field: "materialCode", title: "原料编码", width: 170},
                {field: "materialName", title: "原料名称", width: 170},
                {field: "materialTypeName", title: "原料分类", width: 170},
                {field: "materialTypeCode", title: "原料分类编码", width: 170},
                {field: "standardUnit", title: "最小标准单位", width: 170},
                {field: "createTime", title: "建档时间", width: 170},
                {field: "operatorCode", title: "建档人", width: 170},
                {field: "memo", title: "备注", width: 200}
            ]
        }
    };

    // 已选中货物列表
    $scope.currentMateriaList = {
        primaryId: 'materialCode',
        kendoSetting: {
            editable: true,
            dataSource: params.data,
            columns: [
                {title: "操作", command: [{name: 'del', text: "删除", click: deleteCurrentCargo}], width: 80},
                {field: "materialName", title: "原料名称", width: 120},
                {field: "materialCode", title: "原料编码", width: 120},
                {field: "materialTypeName", title: "所属原料分类", width: 120},
                {field: "standardUnit", title: "最小标准单位", width: 120},
                {field: "amount", title: params.typeName + "数量(点击编辑)", width: 200, kType: 'number', editable: true}
            ],
            save: function (e) {
                var dataItem = e.model;
                _.find(params.data, function (item) {
                    if (item.materialCode === dataItem.materialCode) {
                        item.amount = e.values.amount;
                        return true;
                    }
                });
            }
        }
    };

    // 删除选中的单条货物
    function deleteCurrentCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        swal({
            title: '确定要删除' + dataItem.materialName,
            type: 'warning',
            confirmButtonText: '是的',
            showCancelButton: true
        }).then(function (res) {
            if (res.value) {
                var dataSource = $scope.currentMateriaList.kendoGrid.dataSource;
                _.find(params.data, function (item, index) {
                    if (item.materialCode === dataItem.materialCode) {
                        params.data.splice(index, 1);
                        return true;
                    }
                    return false;
                });
                dataSource.data(params.data);
            }
        });
    }

    // 增加货物
    $scope.addMaterial = function (dataSource) {
        var selectIds = [];
        var currentDataSource = $scope.currentMateriaList.kendoGrid.dataSource;
        if (!dataSource) {
            selectIds = $scope.materialList.kendoGrid.selectedKeyNames();
            dataSource = $scope.materialList.kendoGrid.dataSource.data();
        } else {
            selectIds = [dataSource[0].materialCode];
        }
        var existArray = _.map(params.data, function (item, index) {
            return item.materialCode;
        });
        _.each(dataSource, function (item, index) {
            if (_.indexOf(selectIds, '' + item.materialCode) > -1 && _.indexOf(existArray, '' + item.materialCode) < 0) {
                item.amount = 0;
                params.data.push(item);
            }
        });
        currentDataSource.data(params.data);
    };

    /**
     * 提交选中货物
     */
    $scope.submit = function (dataSource) {
        if (!dataSource) {
            dataSource = $scope.currentMateriaList.kendoGrid.dataSource.data();
        }
        params.cb(dataSource);
        $scope.$close();
    };
});