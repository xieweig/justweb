'use strict';

angular.module('app').controller('DeliveryOutStorageModalCtrl', function ($scope, $timeout, $uibModal, ApiService, Common, data) {
    /**
     查看站点配送计划弹窗
     */
    $scope.params = {};
    $scope.cargoConfigure = data.cargoUnit;
    $scope.materialConfigure = data.materialUnit;
    $scope.modalType = data.type;
    $scope.materialResult = [];

    $scope.storageType = [
        {value: 'NORMAL', text: '正常库'},
        {value: 'STORAGE', text: '仓储库'},
        {value: 'IN_STORAGE', text: '进货库'},
        {value: 'OUT_STORAGE', text: '退货库'},
        {value: 'ON_STORAGE', text: '在途库'},
        {value: 'RESERVE_STORAGE', text: '预留库'}
    ];

    // 出库类型存储
    $scope.outState = [
        {value: 'NOT_OUT', text: '未出库'},
        {value: 'NOT_IN', text: '未入库'},
        {value: 'IN_ING', text: '入库中'},
        {value: 'OUT_ING', text: '出库中'},
        {value: 'OUT_FAILURE', text: '出库失败'},
        {value: 'OUT_SUCCESS', text: '出库成功'},
        {value: 'IN_FAILURE', text: '入库失败'},
        {value: 'IN_SUCCESS', text: '入库成功'}
    ];

    $scope.MaterialGrid = {
        primaryId: 'materialCode',
        kendoSetting: {
            columns: [
                {field: "materialName", title: "原料名称"},
                {field: "materialCode", title: "原料编码"},
                {field: "shippedAmount", title: "应拣数量"},
                {field: "actualAmount", title: "实拣数量"},
                {
                    title: "完成度", template: function (data) {
                        console.log(data)
                        return data.progress + '%'
                    }
                }
            ]
        }
    };

    if ($scope.modalType !== 'edit') {
        // 查看/审核状态的表格(不能编辑)
        $scope.CargoGrid = {
            primaryId: 'cargoCode',
            kendoSetting: {
                columns: [
                    {field: "cargoName", title: "货物名称"},
                    {field: "cargoCode", title: "货物编码"},
                    {field: "rawMaterialName", title: "所属原料"},
                    {
                        field: "standardUnitCode", title: "标准单位", template: function (data) {
                            return getTextByVal($scope.materialConfigure, data.standardUnitCode)
                        }
                    },
                    {
                        title: "规格", template: function (data) {
                            return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                        }
                    },
                    {field: "actualAmount", title: "实拣数量"},
                    {
                        title: "标准单位数量", template: function (data) {
                            return data.number * data.actualAmount
                        }
                    }
                ]
            }
        };
        $scope.onlyCargoGrid = {
            primaryId: 'cargoCode',
            kendoSetting: {
                columns: [
                    {field: "cargoName", title: "货物名称"},
                    {field: "cargoCode", title: "货物编码"},
                    {field: "rawMaterialName", title: "所属原料"},
                    {
                        field: "standardUnitCode", title: "标准单位", template: function (data) {
                            return getTextByVal($scope.materialConfigure, data.standardUnitCode)
                        }
                    },
                    {
                        title: "规格", template: function (data) {
                            return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                        }
                    },
                    {field: "shippedAmount", title: "应拣数量"},
                    {field: "actualAmount", title: "实拣数量"},
                    {
                        title: "标准单位数量", template: function (data) {
                            return parseInt(data.number) * parseInt(data.actualAmount)
                        }
                    }
                ]
            }
        };
    } else {
        // 修改状态的表格(能编辑)
        $scope.CargoGrid = {
            primaryId: 'cargoCode',
            kendoSetting: {
                editable: true,
                columns: [
                    {
                        title: '操作',
                        command: [{name: 'del', text: "删除", click: delWithMaterial}],
                        width: 80
                    },
                    {field: "cargoName", title: "货物名称"},
                    {field: "cargoCode", title: "货物编码"},
                    {field: "rawMaterialName", title: "所属原料"},
                    {
                        field: "standardUnitCode", title: "标准单位", template: function (data) {
                            return getTextByVal($scope.materialConfigure, data.standardUnitCode)
                        }
                    },
                    {
                        title: "规格", template: function (data) {
                            return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                        }
                    },
                    {field: "actualAmount", title: "实拣数量", editable: true},
                    {
                        title: "标准单位数量", template: function (data) {
                            return parseInt(data.number) * parseInt(data.actualAmount)
                        }
                    }
                ],
                save: function (e) {
                    // 每次保存都重新计算总的和原料的拣货数量
                    $timeout(function () {
                        $scope.params.totalAmount = 0;
                        _.each($scope.CargoGrid.kendoGrid.dataSource.data(), function (item) {
                            $scope.params.totalAmount += parseInt(item.actualAmount);
                        });
                        _.each($scope.MaterialGrid.kendoGrid.dataSource.data(), function (material) {
                            material.actualAmount = 0;
                            _.each($scope.CargoGrid.kendoGrid.dataSource.data(), function (cargo) {
                                if (cargo.rawMaterialCode === material.materialCode) {
                                    material.actualAmount += parseInt(cargo.number) * parseInt(cargo.actualAmount)
                                }
                            });
                            material.progress = parseFloat(material.actualAmount / material.shippedAmount * 100).toFixed(2);
                        });
                        $scope.MaterialGrid.kendoGrid.refresh();
                    });
                    return e;
                }
            }
        };
        // 编辑 - 仅按货物
        $scope.onlyCargoGrid = {
            primaryId: 'cargoCode',
            kendoSetting: {
                editable: true,
                autoBind: false,
                columns: [
                    {title: '操作', command: [{name: "del", text: "删除", click: delWithCargo}], width: 140},
                    {field: "cargoName", title: "货物名称"},
                    {field: "cargoCode", title: "货物编码"},
                    {field: "rawMaterialName", title: "所属原料"},
                    {
                        field: "standardUnitCode", title: "标准单位", template: function (data) {
                            return getTextByVal($scope.materialConfigure, data.standardUnitCode)
                        }
                    },
                    {
                        title: "规格", template: function (data) {
                            return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                        }
                    },
                    {field: "shippedAmount", title: "应拣数量"},
                    {field: "actualAmount", title: "实拣数量", editable: true},
                    {
                        title: "标准单位数量", template: function (data) {
                            return parseInt(data.number) * parseInt(data.actualAmount)
                        }
                    }
                ]
            }
        };
    }


    /**
     查看退库出库单
     */
        // 查看单条计划详情
    var getURL = '';
    if ($scope.modalType !== 'audit') {
        getURL = '/api/bill/delivery/findOutStorageByBillCode'
    } else {
        getURL = '/api/bill/delivery/open'
    }
    ApiService.get(getURL + '?billCode=' + data.billCode).then(function (response) {
        if (response.code === '000') {
            var res = response.result.bill;
            _.each(['billCode', 'createTime', 'outWareHouseTime', 'inLocation', 'outLocation', 'planMemo', 'operatorName', 'totalVarietyAmount', 'totalAmount',
                'auditMemo', 'auditPersonName', 'outStorageMemo', 'rootCode', 'sourceCode', 'sourceBillType'], function (name) {
                $scope.params[name] = res[name]
            });
            $scope.showMaterial = (res.basicEnum !== 'BY_CARGO');
            $scope.params.billType = getTextByVal($scope.sourceBillType, res.sourceBillType) + '转';
            $scope.params.inOrOutState = getTextByVal($scope.outState, res.inOrOutState);
            $scope.params.auditState = getTextByVal($scope.auditStatus, res.auditState);
            $scope.params.submitState = getTextByVal($scope.submitStatus, res.submitState);
            $scope.params.inStationName = getTextByVal($scope.station, res.inLocation.stationCode);
            $scope.params.outStationName = getTextByVal($scope.station, res.outLocation.stationCode);
            $scope.params.outStorageName = getTextByVal($scope.storageType, res.outLocation.storage.storageCode);
            $scope.specificBillType = res.specificBillType;

            // 定义变量方便之后调用和修改
            var billDetails = [], cargoList = [];
            if ($scope.showMaterial) {
                billDetails = res.billDetails;

                $scope.materialCodes = [];
                $scope.materialCodes = _.map(res.planBill.childPlanBillDetails, function (item) {
                    return item.rawMaterial.rawMaterialCode
                });
                Common.getMaterialByCodes($scope.materialCodes).then(function (materialList) {

                    cargoList = _.map(billDetails, function (item) {
                        return item.rawMaterial.cargo.cargoCode
                    });

                    if (res.planBill.basicEnum === 'BY_CARGO') {
                        _.each(res.planBill.childPlanBillDetails, function (plan) {
                            cargoList.push(plan.rawMaterial.cargo.cargoCode)
                        })
                    }

                    var materialObject = _.zipObject(_.map(materialList, function (item) {
                        return item.materialCode
                    }), materialList);

                    Common.getCargoByCodes(cargoList).then(function (cargoList) {
                        var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                            return item.cargoCode
                        }), cargoList);

                        _.each(materialList, function (item) {
                            var sp = 0;
                            if (res.planBill.basicEnum === 'BY_CARGO') {
                                _.each(res.planBill.childPlanBillDetails, function (plan) {
                                    if (plan.rawMaterial.rawMaterialCode === item.materialCode) {
                                        sp += plan.amount * cargoObject[plan.rawMaterial.cargo.cargoCode].number;
                                    }
                                })
                            } else {
                                _.each(res.planBill.childPlanBillDetails, function (plan) {
                                    if (plan.rawMaterial.rawMaterialCode === item.materialCode) {
                                        sp = plan.amount;
                                    }
                                })
                            }

                            $scope.MaterialGrid.kendoGrid.dataSource.add({
                                materialName: item.materialName,
                                materialCode: item.materialCode,
                                materialId: item.materialId,
                                shippedAmount: sp,
                                actualAmount: 0,
                                progress: parseFloat(0).toFixed(2)
                            })
                        });

                        _.each(billDetails, function (item) {
                            // 将相应货物信息添加进billDetails
                            item.cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                            item.material = materialObject[item.rawMaterial.rawMaterialCode];
                            $scope.CargoGrid.kendoGrid.dataSource.add({
                                cargoName: item.cargo.cargoName,
                                cargoCode: item.cargo.cargoCode,
                                rawMaterialName: item.material.materialName,
                                rawMaterialCode: item.material.materialCode,
                                rawMaterialId: item.material.materialId,
                                number: item.cargo.number,
                                standardUnitCode: item.cargo.standardUnitCode,
                                shippedAmount: item.shippedAmount,
                                actualAmount: item.actualAmount,
                                measurementCode: item.cargo.measurementCode
                            });

                            _.each($scope.MaterialGrid.kendoGrid.dataSource.data(), function (material) {
                                if (material.materialCode === item.material.materialCode) {
                                    material.actualAmount += item.actualAmount * item.cargo.number;
                                    material.progress = parseFloat(material.actualAmount / material.shippedAmount * 100).toFixed(2);
                                }
                            });
                        });
                        $scope.MaterialGrid.kendoGrid.refresh();
                    })
                });
            } else {
                // 按货物
                billDetails = res.billDetails;
                cargoList = _.map(billDetails, function (item) {
                    return item.rawMaterial.cargo.cargoCode
                });
                if (!res.planBill) {
                    res.planBill = {
                        childPlanBillDetails: []
                    }
                }
                _.each(res.planBill.childPlanBillDetails, function (plan) {
                    cargoList.push(plan.rawMaterial.cargo.cargoCode)
                });

                Common.getCargoByCodes(cargoList).then(function (cargoList) {
                    // cargoList: 货物详细信息
                    var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                        return item.cargoCode
                    }), cargoList);

                    var cargoDetails = _.cloneDeep(billDetails);
                    _.each(res.planBill.childPlanBillDetails, function (plan) {
                        var isExist = false;
                        _.each(cargoDetails, function (cargo) {
                            if (cargo.rawMaterial.cargo.cargoCode === plan.rawMaterial.cargo.cargoCode) {
                                isExist = true
                            }
                        });
                        if (!isExist) {
                            cargoDetails.push({
                                actualAmount: 0,
                                shippedAmount: plan.amount,
                                rawMaterial: plan.rawMaterial
                            })
                        }
                    });

                    // 原料Code列表
                    var materialList = [];
                    _.each(cargoDetails, function (item) {
                        // 将相应货物信息添加进billDetails
                        item.cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                        materialList.push(item.rawMaterial.rawMaterialCode)
                    });

                    Common.getMaterialByCodes(materialList).then(function (materialList) {
                        var materialObject = _.zipObject(_.map(materialList, function (item) {
                            return item.materialCode
                        }), materialList);
                        _.each(cargoDetails, function (item) {
                            // materialList: 原料详细信息
                            item.material = materialObject[item.rawMaterial.rawMaterialCode];
                            $scope.onlyCargoGrid.kendoGrid.dataSource.add({
                                cargoName: item.cargo.cargoName,
                                cargoCode: item.cargo.cargoCode,
                                rawMaterialName: item.material.materialName,
                                rawMaterialCode: item.material.materialCode,
                                number: item.cargo.number,
                                standardUnitCode: item.cargo.standardUnitCode,
                                amount: item.cargo.amount,
                                actualAmount: item.actualAmount,
                                shippedAmount: item.shippedAmount,
                                measurementCode: item.cargo.measurementCode
                            })
                        })
                    })
                })
            }
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError);

    // 导出
    $scope.export = function () {
        alert('export')
    };

    /**
     修改退库出库单
     */

    $scope.addCargo = function () {
        var dataSource = $scope.onlyCargoGrid.kendoGrid.dataSource;
        initAddModal(dataSource)
    };

    function initAddModal() {
        if ($scope.showMaterial) {
            $scope.addModal = $uibModal.open({
                templateUrl: 'app/bill/common/modals/addCargoWithMaterialGroup.html',
                size: 'lg',
                controller: 'AddCargoWithMaterialGroupCtrl',
                resolve: {
                    cb: function () {
                        return function (data) {
                            // 回调表格数据到外部表格
                            $scope.params.totalVarietyAmount = 0;
                            $scope.params.totalAmount = 0;
                            _.each(data, function (item) {
                                $scope.params.totalVarietyAmount++;
                                $scope.params.totalAmount += item.actualAmount * item.number;
                            });
                            // $scope.cargoList = data;
                            $scope.CargoGrid.kendoGrid.dataSource.data(data);
                            $scope.MaterialGrid.kendoGrid.refresh();
                            $scope.addModal.close()
                        }
                    },
                    data: {
                        cl: $scope.CargoGrid.kendoGrid.dataSource.data(),
                        m: $scope.MaterialGrid.kendoGrid.dataSource.data()
                    }
                }
            });
        } else {
            $scope.addModal = $uibModal.open({
                templateUrl: 'app/bill/common/modals/addCargoWithMaterial.html',
                size: 'lg',
                controller: 'AddCargoWithMaterialCtrl',
                resolve: {
                    cb: function () {
                        return function (data) {
                            // 回调表格数据到外部表格
                            $scope.cargoList = data;
                            $scope.onlyCargoGrid.kendoGrid.dataSource.data(data);
                            $scope.addModal.close()
                        }
                    },
                    data: {
                        cl: $scope.onlyCargoGrid.kendoGrid.dataSource.data()
                    }
                }
            });
        }
    }

    // 原料中的货物删除
    function delWithMaterial(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.CargoGrid.kendoGrid.dataSource.remove(dataItem);
        // 修改退库数量和品种
        $scope.params.totalAmount = parseInt($scope.params.totalAmount) - parseInt(dataItem.actualAmount);
        $scope.params.totalVarietyAmount--;
        // 修改原料
        _.each($scope.MaterialGrid.kendoGrid.dataSource.data(), function (item) {
            if (item.materialCode === dataItem.rawMaterialCode) {
                item.actualAmount = parseInt(item.actualAmount) - (parseInt(dataItem.number) * parseInt(dataItem.actualAmount));
                item.progress = parseFloat(item.actualAmount / item.shippedAmount * 100).toFixed(2)
            }
        });
        $scope.MaterialGrid.kendoGrid.refresh();
    }

    $scope.addOnlyCargo = function () {
        var dataSource = $scope.onlyCargoGrid.kendoGrid.dataSource;
        initAddCargoModal(dataSource)
    };

    function initAddCargoModal() {
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/common/modals/addCargoWithMaterial.html',
            size: 'lg',
            controller: 'AddCargoWithMaterialCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        // 重新计算各种数据
                        $scope.params.totalVarietyAmount = 0;
                        $scope.params.totalAmount = 0;
                        var dataSource = $scope.onlyCargoGrid.kendoGrid.dataSource;
                        dataSource.data([]);
                        _.each(data, function (item) {
                            $scope.params.totalVarietyAmount++;
                            $scope.params.totalAmount += parseInt(item.actualAmount);
                            if (!item.shippedAmount) {
                                item.shippedAmount = 0
                            }
                            dataSource.add(item)
                        });
                        $scope.addModal.close()
                    }
                },
                data: {
                    cl: $scope.onlyCargoGrid.kendoGrid.dataSource.data(),
                    cargoUnit: data.cargoUnit,
                    materialUnit: data.materialUnit
                },
                form: function () {
                    return _.map($scope.onlyCargoGrid.kendoGrid.dataSource.data(), function (item) {
                        return combinationItem(item);
                    })
                }
            }
        });
    }

    function combinationItem(item) {
        return {
            "createTime": item.createTime,
            "updateTime": item.updateTime,
            "cargoId": item.cargoId,
            "cargoCode": item.cargoCode,
            "barCode": item.barCode,
            "selfBarCode": item.selfBarCode,
            "originalName": item.originalName,
            "cargoName": item.cargoName,
            "effectiveTime": item.effectiveTime,
            "measurementCode": item.measurementCode,
            "standardUnitCode": item.standardUnitCode,
            "memo": item.memo,
            "number": item.number,
            "rawMaterialId": item.rawMaterialId,
            "operatorCode": item.operatorCode,
            "cargoType": item.cargoType,
            "rawMaterialName": item.rawMaterialName,
            "rawMaterialCode": item.rawMaterialCode,
            "configureName": item.configureName,
            "dateInProduced": item.dateInProduced,
            "unitPrice": item.unitPrice,
            "actualAmount": item.actualAmount,
            "shippedAmount": item.shippedAmount,
        };
    }

    // 删除
    function delWithCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.onlyCargoGrid.kendoGrid.dataSource.remove(dataItem);
        // 修改数量
        $scope.params.totalAmount = $scope.params.totalAmount - parseInt(dataItem.actualAmount);
    }

    $scope.bill = {
        billType: 'DELIVERY',
        // specificBillType: $scope.specificBillType,
        billPurpose: 'OUT_STORAGE'
    };

    $scope.save = function () {
        saveOrAudit('save', _.cloneDeep($scope.bill))
    };

    $scope.submit = function () {
        saveOrAudit('submit', _.cloneDeep($scope.bill))
    };

    // 保存和提交
    function saveOrAudit(type, bill) {
        var url = '';
        if (type === 'save') {
            url = '/api/bill/delivery/save'
        } else {
            url = '/api/bill/delivery/submit'
        }
        bill.billCode = $scope.params.billCode;
        // bill.sourceCode = $scope.params.billCode;
        bill.specificBillType = $scope.specificBillType;
        bill.sourceBillType = $scope.params.sourceBillType;
        if ($scope.sourceBillType !== 'NO_PLAN') {
            bill.sourceCode = $scope.params.sourceCode
        }
        bill.rootCode = $scope.params.rootCode;

        bill.outStorageMemo = $scope.params.outStorageMemo;

        bill.outLocation = {
            stationCode: $scope.params.outLocation.stationCode,
            stationName: $scope.params.outLocation.stationName,
            // stationType: $.cookie('STORE'),
            storage: {
                storageCode: $scope.params.outLocation.storage.storageCode,
                storageName: $scope.params.outLocation.storage.storageName
            }
        };
        bill.inLocation = {
            stationCode: $scope.params.inLocation.stationCode,
            stationName: $scope.params.inLocation.stationName,
            // stationType: 'LOGISTICS',
            storage: {
                storageCode: $scope.params.inLocation.storage.storageCode,
                storageName: $scope.params.inLocation.storage.storageName
            }
        };

        if ($scope.showMaterial) {
            // 按原料
            bill.basicEnum = 'BY_MATERIAL';
            bill.billDetails = _.map($scope.CargoGrid.kendoGrid.dataSource.data(), function (item) {
                return {
                    rawMaterial: {
                        rawMaterialCode: item.rawMaterialCode,
                        rawMaterialName: item.rawMaterialName,
                        cargo: {
                            cargoCode: item.cargoCode,
                            cargoName: item.cargoName
                        }
                    },
                    actualAmount: item.actualAmount,
                    shippedAmount: item.shippedAmount
                }
            })
        } else {
            // 按货物
            bill.basicEnum = 'BY_CARGO';
            bill.billDetails = _.map($scope.onlyCargoGrid.kendoGrid.dataSource.data(), function (item) {
                return {
                    rawMaterial: {
                        rawMaterialCode: item.rawMaterialCode,
                        rawMaterialName: item.rawMaterialName,
                        cargo: {
                            cargoCode: item.cargoCode,
                            cargoName: item.cargoName
                        }
                    },
                    actualAmount: item.actualAmount,
                    shippedAmount: item.shippedAmount
                }
            });
        }
        ApiService.post(url, bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功!', '', 'success').then(function () {
                    $scope.$close()
                })
            }
        }, apiServiceError);
        $scope.$close();
    }

    /**
     * 审核退库出库单
     */
    $scope.audit = function (type) {
        var url = '';
        if (type === 'success') {
            url = '/api/bill/delivery/auditSuccess'
        } else {
            url = '/api/bill/delivery/auditFailure'
        }
        var bill = {
            billCode: $scope.params.billCode,
            auditMemo: $scope.params.auditMemo,
            outLocation: {
                stationCode: $scope.params.outLocation.stationCode,
                stationName: $scope.params.outLocation.stationName,
                storage: {
                    storageCode: $scope.params.outLocation.storage.storageCode,
                    storageName: $scope.params.outLocation.storage.storageName
                }
            }
        };
        ApiService.post(url, bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                // alert('success')
                swal('审核成功!', '', 'success').then(function () {
                    $scope.$close();
                });
            }
        });
        $scope.$close();
    };
});