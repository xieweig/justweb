'use strict';

angular.module('app').controller('AddCargoModalCtrl', function ($scope, cb, data, cargoUnit, materialUnit) {
    $scope.params = {};
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
                if (response.code !== '000') {
                    swal('', response.message, 'error');
                } else {
                    var result = [];
                    if (response.result && response.result.result.content) {
                        result = response.result.result.content;
                        if (result.length === 1) {
                            $scope.addCargo(result);
                        }
                    }
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
                {field: "originalName", title: "货物内部名称", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {field: "barCode", title: "货物条码", width: 120},
                {field: "selfBarCode", title: "自定义条码", width: 120},
                {field: "effectiveTime", title: "保质期(天)", width: 120},
                {
                    title: "规格", width: 120,
                    template: function (data) {
                        return data.number + getTextByVal(cargoUnit, data.measurementCode);
                    }
                },
                {
                    title: "最小标准单位", width: 120,
                    template: function (data) {
                        return getTextByVal(materialUnit, data.standardUnitCode);
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
            editable: 'inline',
            dataSource: data,
            columns: [
                {title: "操作", command: [{name: 'edit', text: "编辑"}, {name: 'del', text: "删除", click: deleteCurrentCargo}], width: 160},
                {field: "cargoName", title: "货物名称", width: 120},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {
                    title: "规格", width: 120,
                    template: function (data) {
                        return data.number + getTextByVal(cargoUnit, data.measurementCode);
                    }
                },
                {
                    title: "最小标准单位", width: 120,
                    template: function (data) {
                        return getTextByVal(materialUnit, data.standardUnitCode);
                    }
                },
                {field: "productDate", title: "生产日期", width: 120, WdatePicker: {maxDate: new Date()}, editable: true},
                {field: "purchasePrice", title: "单位进价", width: 120, editable: true, kType: 'decimal'},
                {field: "amount", title: "发货数量", width: 200, kType: 'number', editable: true}
            ]
        }
    };

    // 删除选中的单条货物
    function deleteCurrentCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        swal({
            title: '确定要删除该项?',
            type: 'warning',
            confirmButtonText: '是的',
            showCancelButton: true
        }).then(function (res) {
            if (res.value) {
                var dataSource = $scope.currentCargoList.kendoGrid.dataSource;
                _.find(dataSource.data(), function (item, index) {
                    if (item.cargoCode === dataItem.cargoCode) {
                        dataSource.remove(dataSource.at(index));
                        return true;
                    }
                    return false;
                });
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
        var existArray = _.map(currentDataSource.data(), function (item, index) {
            return item.cargoCode;
        });
        _.each(dataSource, function (item, index) {
            if (_.indexOf(selectIds, '' + item.cargoCode) > -1 && _.indexOf(existArray, '' + item.cargoCode) < 0) {
                currentDataSource.add(item);
            }
        });
    };

    /**
     * 提交选中货物
     */
    $scope.submit = function (dataSource) {
        if (!dataSource) {
            dataSource = $scope.currentCargoList.kendoGrid.dataSource.data();
        }
        var result = _.map(dataSource, function (item) {
            return {
                barCode: item.barCode,
                cargoCode: item.cargoCode,
                cargoId: item.cargoId,
                cargoName: item.cargoName,
                cargoType: item.cargoType,
                createTime: item.createTime,
                effectiveTime: item.effectiveTime,
                logicStatus: item.logicStatus,
                measurementCode: item.measurementCode,
                memo: item.memo,
                number: item.number,
                originalName: item.originalName,
                rawMaterialId: item.rawMaterialId,
                rawMaterialName: item.rawMaterialName,
                selfBarCode: item.selfBarCode,
                standardUnitCode: item.standardUnitCode,
                updateTime: item.updateTime,
                dateInProduced: item.productDate,
                unitPrice: item.purchasePrice,
                actualAmount: item.amount
            };
        });
        cb(result);
        $scope.$close();
    };
});