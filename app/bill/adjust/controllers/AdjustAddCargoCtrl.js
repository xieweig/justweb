'use strict';

angular.module('app').controller('AdjustAddCargoCtrl', function ($scope, params) {
    if (!params.data) {
        params.data = [];
    }
    if (!params.material) {
        params.material = {amount: 0};
    }
    $scope.material = params.material;
    $scope.material.actualAmount = 0;
    _.each(params.data, function (item) {
        var actualAmount = parseInt(item.actualAmount) || 0;
        $scope.material.actualAmount += actualAmount;
    });
    $scope.params = {rawMaterialId: params.material.materialId};
    $scope.search = function () {
        $scope.cargoList.kendoGrid.dataSource.page(1);
    };
    // 条件查询的货物列表
    $scope.cargoList = {
        url: COMMON_URL.baseInfo + '/api/v1/baseInfo/cargo/findByCondition',
        params: $scope.params,
        primaryId: 'cargoCode',
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
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "cargoName", title: "货物名称", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {field: "barCode", title: "货物条码", width: 120},
                {field: "selfBarCode", title: "自定义条码", width: 120},
                {field: "effectiveTime", title: "保质期(天)", width: 120},
                {
                    title: "规格", width: 120,
                    template: function (data) {
                        return data.number + getTextByVal(params.cargoUnit, data.measurementCode);
                    }
                },
                {
                    title: "最小标准单位", width: 120,
                    template: function (data) {
                        return getTextByVal(params.materialUnit, data.standardUnitCode);
                    }
                },
                {field: "createTime", title: "建档时间", width: 120},
                {field: "memo", title: "备注", width: 200}
            ]
        }
    };

    // 已选中货物列表
    $scope.currentCargoList = {
        primaryId: 'cargoCode',
        persistSelection: true,
        kendoSetting: {
            editable: true,
            dataSource: params.data,
            columns: [
                {title: "操作", command: [{name: 'del', text: "删除", click: deleteCurrentCargo}], width: 80},
                {field: "cargoName", title: "货物名称", width: 120},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {
                    title: "最小标准单位", width: 120,
                    template: function (data) {
                        return getTextByVal(params.materialUnit, data.standardUnitCode);
                    }
                },
                {
                    title: "规格", width: 120,
                    template: function (data) {
                        return data.number + getTextByVal(params.cargoUnit, data.measurementCode);
                    }
                },
                {field: "actualAmount", title: "实拣数量(点击编辑)", width: 200, kType: 'number', editable: true}
            ],
            save: function (e) {
                $scope.material.actualAmount = 0;
                _.each(e.sender.dataSource.data(), function (item) {
                    var actualAmount = 0;
                    var number = item.number;
                    if (!number || number !== number) {
                        number = 0;
                    }
                    if (item.cargoCode === e.model.cargoCode) {
                        actualAmount = parseInt(e.values.actualAmount) || 0;
                    } else {
                        actualAmount = parseInt(item.actualAmount) || 0;
                    }
                    $scope.material.actualAmount += number * actualAmount;
                });
            }
        }
    };

    // 删除选中的单条货物
    function deleteCurrentCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        swal({
            title: '确定要删除' + dataItem.cargoName,
            type: 'warning',
            confirmButtonText: '是的',
            showCancelButton: true
        }).then(function (res) {
            if (res.value) {
                var dataSource = $scope.currentCargoList.kendoGrid.dataSource;
                _.find(params.data, function (item, index) {
                    if (item.cargoCode === dataItem.cargoCode) {
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
    $scope.addCargo = function (dataSource) {
        var selectIds = [];
        var currentDataSource = $scope.currentCargoList.kendoGrid.dataSource;
        if (!dataSource) {
            selectIds = $scope.cargoList.kendoGrid.selectedKeyNames();
            dataSource = $scope.cargoList.kendoGrid.dataSource.data();
        } else {
            selectIds = [dataSource[0].cargoCode];
        }
        var existArray = _.map(params.data, function (item, index) {
            return item.cargoCode;
        });
        _.each(dataSource, function (item, index) {
            if (_.indexOf(selectIds, '' + item.cargoCode) > -1 && _.indexOf(existArray, '' + item.cargoCode) < 0) {
                item.actualAmount = 0;
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
            dataSource = $scope.currentCargoList.kendoGrid.dataSource.data();
        }
        params.cb(dataSource);
        $scope.$close();
    };
});