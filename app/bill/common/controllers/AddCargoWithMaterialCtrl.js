'use strict';

angular.module('app').controller('AddCargoWithMaterialCtrl', function ($scope, $timeout, cb, data) {
    $scope.params = {};
    $scope.cargoConfigure = data.cargoUnit;
    $scope.materialConfigure = data.materialUnit;
    $scope.material = {};
    $scope.show = data.hasOwnProperty('m');

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
                            result[0].actualAmount = 0;
                            $timeout(function () {
                                $scope.addCargo(result[0].cargoCode);
                            });
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
            height: 250,
            columns: [
                {selectable: true},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "originalName", title: "货物内部名称", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {field: "barCode", title: "货物条码", width: 120},
                {field: "selfBarCode", title: "自定义条码", width: 120},
                {field: "effectiveTime", title: "保质期(天)", width: 120},
                {
                    title: "规格", width: 120, template: function (data) {
                    return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                }
                },
                {
                    title: "最小标准单位", width: 120, template: function (data) {
                    return getTextByVal($scope.materialConfigure, data.standardUnitCode)
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
            autoBind: false,
            editable: true,
            height: 200,
            persistSelection: true,
            columns: [
                {title: "操作", locked: true, command: [{name: 'select', text: "删除", click: delCurCargo}], width: 80},
                {field: "cargoName", title: "货物名称", width: 120},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {
                    title: "标准单位", width: 120, template: function (data) {
                    return getTextByVal($scope.materialConfigure, data.standardUnitCode)
                }
                },
                {
                    title: "规格", width: 120, template: function (data) {
                    return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                }
                },
                {field: "actualAmount", title: "货物数量(点击修改)", width: 120, kType: 'number', editable: true}
            ],
            save: function (e) {
                // 每次保存都重新计算完成度
                $timeout(function () {
                    $scope.material.actualAmount = 0;
                    _.each($scope.currentCargoList.kendoGrid.dataSource.data(), function (item) {
                        $scope.material.actualAmount += parseInt(item.actualAmount) * parseInt(item.number);
                    });
                    $scope.material.progress = parseFloat($scope.material.actualAmount / $scope.material.shippedAmount * 100).toFixed(2) + '%';
                });
                return e
            }
        }
    };

    // 同步已选中数据
    $timeout(function () {
        _.each(data.cl, function (item) {
            $scope.currentCargoList.kendoGrid.dataSource.add(item)
        });
        if ($scope.show) {
            $scope.material.materialName = data.m.materialName;
            $scope.material.shippedAmount = data.m.shippedAmount;
            $scope.material.actualAmount = 0;
            $scope.material.rawMaterialCode = data.m.rawMaterialCode;
            $scope.material.progress = data.m.progress;
        }
    }, 100);

    // 增加货物
    $scope.addCargo = function (selectIds) {
        if (!selectIds) {
            var selectIds = $scope.cargoList.kendoGrid.selectedKeyNames();
        } else {
            selectIds = [selectIds]
        }
        var dataSource = $scope.cargoList.kendoGrid.dataSource;
        var currentDataSource = $scope.currentCargoList.kendoGrid.dataSource;
        var cargoCodeList = _.map(currentDataSource.data(), function (item) {
            return item.cargoCode
        });
        _.each(dataSource.data(), function (item, index) {
            if (_.indexOf(selectIds, '' + item.cargoCode) > -1 && _.indexOf(cargoCodeList, '' + item.cargoCode) === -1) {
                // 判断是否需要区分原料
                if ($scope.show) {
                    if (item.rawMaterialCode.toString() === $scope.material.rawMaterialCode) {
                        // 添加货物预置数量
                        if ($scope.material.shippedAmount > $scope.material.actualAmount) {
                            item.actualAmount = parseInt((parseInt($scope.material.shippedAmount) - parseInt($scope.material.actualAmount)) / parseInt(item.number));
                        } else {
                            item.actualAmount = 0;
                        }
                        currentDataSource.add(item);
                    }
                }
                else {
                    currentDataSource.add(item);
                }
            }
        });
    };

    /**
     * 提交选中货物
     */
    $scope.submit = function () {
        var result = _.map($scope.currentCargoList.kendoGrid.dataSource.data(), function (item) {
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
                rawMaterialCode: item.rawMaterialCode,
                rawMaterialName: item.rawMaterialName,
                selfBarCode: item.selfBarCode,
                standardUnitCode: item.standardUnitCode,
                shippedAmount: item.shippedAmount,
                updateTime: item.updateTime,
                actualAmount: item.actualAmount || 0
            };
        });
        cb(result);
    };

    // 删除当前货物
    function delCurCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.currentCargoList.kendoGrid.dataSource.remove(dataItem)
    }

});