'use strict';

angular.module('app').controller('AddCargoWithMaterialGroupCtrl', function ($scope, $timeout, cb, data) {
    $scope.params = {};
    $scope.show = data.hasOwnProperty('m');
    $scope.materialCodeList = [];

    $scope.search = function () {
        $scope.cargoList.kendoGrid.dataSource.page(1);
    };

    // 条件查询的货物列表
    $scope.cargoList = {
        url: COMMON_URL.baseInfo + '/api/v1/baseInfo/cargo/findByCondition',
        params: $scope.params,
        primaryId: 'cargoCode',
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
            editable: true,
            height: 250,
            columns: [
                {title: "操作", locked: true, command: [{name: 'select', text: "删除", click: delCurCargo}], width: 80},
                {field: "cargoName", title: "货物名称", width: 120},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {
                    field: "standardUnitCode", title: "标准单位", width: 120, template: function (data) {
                        return getTextByVal($scope.materialConfigure, data.standardUnitCode)
                    }
                },
                {
                    title: "规格", width: 120, template: function (data) {
                        return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                    }
                },
                {field: "actualAmount", title: "货物数量", width: 120, editable: true}
            ],
            save: function (e) {
                syncData();
                return e;
            }
        }
    };

    // 当前原料列表
    $scope.currentMaterialGrid = {
        primaryId: 'code',
        kendoSetting: {
            columns: [
                {field: "materialName", title: "原料名称"},
                {field: "materialCode", title: "原料编码"},
                {field: "shippedAmount", title: "应拣数量"},
                {field: "actualAmount", title: "实拣数量"},
                {title: "完成度", template: function (data) {
                        return data.progress + '%'
                    }}
            ]
        }
    };

    // 同步已选中数据
    $timeout(function () {
        _.each(data.cl, function (item) {
            $scope.currentCargoList.kendoGrid.dataSource.add(item)
        });
        var materialIdList = [];
        _.each(data.m, function (item) {
            materialIdList.push(item.materialId);
            $scope.materialCodeList.push(item.materialCode);
            $scope.currentMaterialGrid.kendoGrid.dataSource.add(item)
        });
        $scope.params.rawMaterialId = materialIdList.join(',')
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
                    if ($scope.materialCodeList.indexOf(item.rawMaterialCode) > -1) {
                        // 添加货物预置数量
                        // if ($scope.material.shippedAmount > $scope.material.actualAmount) {
                        //     item.actualAmount = parseInt((parseInt($scope.material.shippedAmount) - parseInt($scope.material.actualAmount)) / parseInt(item.number));
                        // } else {
                        //     item.actualAmount = 0;
                        // }
                        item.actualAmount = 0;
                        currentDataSource.add(item);

                        $timeout(function () {
                            $scope.params.totalAmount = 0;
                            _.each($scope.currentCargoList.kendoGrid.dataSource.data(), function (item) {
                                $scope.params.totalAmount += parseInt(item.actualAmount);
                            });
                            _.each($scope.currentMaterialGrid.kendoGrid.dataSource.data(), function (material) {
                                material.actualAmount = 0;
                                _.each($scope.currentCargoList.kendoGrid.dataSource.data(), function (cargo) {
                                    if (cargo.rawMaterialCode === material.materialCode) {
                                        material.actualAmount += parseInt(cargo.number) * parseInt(cargo.actualAmount)
                                    }
                                });
                                material.progress = parseFloat(material.actualAmount / material.shippedAmount * 100).toFixed(2);
                            });
                            $scope.currentMaterialGrid.kendoGrid.refresh();
                        })


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
            _.each(data.m, function (material) {
                if (material.materialCode === item.rawMaterialCode) {
                    item.shippedAmount = material.shippedAmount
                }
            });
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
                shippedAmount: item.shippedAmount,
                standardUnitCode: item.standardUnitCode,
                updateTime: item.updateTime,
                actualAmount: item.actualAmount
            };
        });
        cb(result);
    };

    // 删除当前货物
    function delCurCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.currentCargoList.kendoGrid.dataSource.remove(dataItem);
        syncData()
    }

    function syncData() {
        $timeout(function () {
            $scope.params.totalAmount = 0;
            $scope.params.totalVarietyAmount = 0;
            _.each($scope.currentCargoList.kendoGrid.dataSource.data(), function (item) {
                $scope.params.totalAmount += parseInt(item.actualAmount);
                $scope.params.totalVarietyAmount ++;
            });
            _.each($scope.currentMaterialGrid.kendoGrid.dataSource.data(), function (material) {
                material.actualAmount = 0;
                material.progress = 0.00;
                _.each($scope.currentCargoList.kendoGrid.dataSource.data(), function (cargo) {
                    if (cargo.rawMaterialCode === material.materialCode) {
                        material.actualAmount += parseInt(cargo.number) * parseInt(cargo.actualAmount);
                        material.progress = parseFloat(material.actualAmount / material.shippedAmount * 100).toFixed(2);
                    }
                });
                console.log(material)
            });
            $scope.currentMaterialGrid.kendoGrid.refresh();
        });
    }
});