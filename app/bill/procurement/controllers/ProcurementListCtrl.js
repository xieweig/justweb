'use strict';

angular.module('app').controller('ProcurementListCtrl', function ($scope, $state, $uibModal, ApiService, Common, cargoUnit, materialUnit) {


    // 表格参数及搜索
    $scope.params = {};
    $scope.curSubmitStatus = {};
    $scope.curAuditStatus = {};

    $scope.resetPage = function () {
        $state.reload($state.current.name);
    };

    $scope.toList = function () {
        $state.go('app.bill.procurement.list');
    };

    $scope.supplierTreeOpt = {
        type: 'supplier',
        callback: function (data) {
            $scope.params.supplierCodes = _.map(data, function (item) {
                return item.supplierCode
            });
        }
    };

    $scope.search = function () {
        $scope.procurementGrid.kendoGrid.dataSource.page(1);
    };
    $scope.procurementGrid = {
        url: '/api/bill/purchase/findPurchaseByConditions',
        params: $scope.params,
        dataSource: {
            parameterMap: function (params) {
                params.submitStates = [];
                _.each($scope.curSubmitStatus, function (item, key) {
                    if (item) {
                        params.submitStates.push(key);
                    }
                });
                params.auditStates = [];
                _.each($scope.curAuditStatus, function (item, key) {
                    if (item) {
                        params.auditStates.push(key);
                    }
                });
            },
            data: function (response) {
                var data = getKendoData(response);
                var supplierCodes = [];
                _.each(data, function (item) {
                    // 站点及库位
                    if (!item.inLocation) {
                        item.inLocation = {storage: {}};
                    }
                    if (!item.inLocation.storage) {
                        item.inLocation.storage = {};
                    }
                    // 供应商
                    if (!item.supplier) {
                        item.supplier = {};
                    } else {
                        supplierCodes.push(item.supplier.supplierCode);
                    }
                    // 表格中的实收 差值等计算
                    item.statistical = {actualAmount: 0, differenceAmount: 0, actualPrice: 0, differencePrice: 0};
                    _.each(item.billDetails, function (billItem) {
                        var actualAmount = parseInt(billItem.actualAmount);
                        var shippedAmount = parseInt(billItem.shippedAmount);
                        var differenceNumber = shippedAmount - actualAmount;
                        var unitPrice = parseFloat(billItem.unitPrice);

                        item.statistical.actualAmount += actualAmount;
                        item.statistical.differenceAmount += differenceNumber;
                        item.statistical.actualPrice += actualAmount * unitPrice;
                        item.statistical.differencePrice += differenceNumber * unitPrice;
                    });
                });

                // 回显供应商
                Common.getSupplierByIds(supplierCodes).then(function (supplierList) {
                    var supplierObj = _.zipObject(_.map(supplierList, function (item) {
                        return item.supplierCode;
                    }), supplierList);
                    var dataSource = $scope.procurementGrid.kendoGrid.dataSource;
                    _.each(dataSource.data(), function (item, index) {
                        var supplier = supplierObj[item.get('supplier.supplierCode')];
                        if (supplier) {
                            item.set('supplier.supplierCode', supplier.supplierName);
                        }
                    });
                });
                return data;
            }
        },
        kendoSetting: {
            // autoBind: false,
            pageable: true,
            columns: [
                {
                    title: "操作", width: 220,
                    command: [
                        {name: 't', text: "查看", click: openViewModal},
                        {
                            name: 'e', text: "修改",
                            click: openEditModal,
                            visible: function (dataItem) {
                                return dataItem.submitState !== 'SUBMITTED' || (dataItem.submitState === 'SUBMITTED' && dataItem.auditState === 'AUDIT_FAILURE');
                            }
                        },
                        {
                            name: 'audit', text: "审核",
                            click: openAuditModal,
                            visible: function (dataItem) {
                                return (dataItem.auditState === 'UN_REVIEWED' || dataItem.auditState === 'AUDIT_ING') && dataItem.submitState === 'SUBMITTED';
                            }
                        }
                    ]
                },
                {field: "billCode", title: "单号", width: 120},
                {field: "inWareHouseTime", title: "入库时间", width: 120},
                {title: "录单时间", width: 180, template: '#: formatDate(data.createTime?new Date(data.createTime):"","yyyy-MM-dd HH:mm:ss") #'},
                {field: "operatorCode", title: "录单人", width: 120},
                {field: "auditPersonCode", title: "审核人", width: 120},
                {
                    title: "入库站点", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.station, data.inLocation.stationCode)
                    }
                },
                {
                    title: "入库库房", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.outType, data.inLocation.storage.storageCode)
                    }
                },
                {field: "statistical.actualAmount", title: "实收数量", width: 120},
                {field: "statistical.differenceAmount", title: "数量差值", width: 120},
                {field: "statistical.actualPrice", title: "进货实洋", width: 120},
                {field: "statistical.differencePrice", title: "总价值差", width: 120},
                {field: "supplier.supplierCode", title: "供应商", width: 120, editable: true},
                {
                    title: "提交状态", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.auditStatus, data.auditState);
                    }
                },
                {
                    title: "审核状态", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.submitStatus, data.submitState);
                    }
                },
                {field: "memo", title: "备注", width: 120}
            ]
        }
    };

    // 打开查看界面
    function openViewModal(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        loadCargo(dataItem.billCode, function (purchaseBill) {
            $uibModal.open({
                templateUrl: 'app/bill/procurement/modals/look.html',
                size: 'lg',
                controller: 'ProcurementLookCtrl',
                resolve: {
                    params: {
                        type: 'look',
                        purchaseBill: purchaseBill,
                        cargoUnit: cargoUnit,
                        materialUnit: materialUnit
                    }
                }
            }).closed.then(function () {
                $scope.procurementGrid.kendoGrid.dataSource.read();
            });
        });
    }

    // 打开审核界面
    function openAuditModal(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        loadCargo(dataItem.billCode, function (purchaseBill) {
            $uibModal.open({
                templateUrl: 'app/bill/procurement/modals/look.html',
                size: 'lg',
                controller: 'ProcurementLookCtrl',
                resolve: {
                    params: {
                        type: 'audit',
                        purchaseBill: purchaseBill,
                        cargoUnit: cargoUnit,
                        materialUnit: materialUnit
                    }
                }
            }).closed.then(function () {
                $scope.procurementGrid.kendoGrid.dataSource.read();
            });
        }, true);
    }

    // 打开修改界面
    function openEditModal(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        loadCargo(dataItem.billCode, function (purchaseBill) {
            $uibModal.open({
                templateUrl: 'app/bill/procurement/modals/edit.html',
                size: 'lg',
                controller: 'ProcurementEditCtrl',
                resolve: {
                    params: {
                        type: 'edit',
                        purchaseBill: purchaseBill
                    },
                    cargoUnit: function () {
                        return cargoUnit;
                    },
                    materialUnit: function () {
                        return materialUnit;
                    }
                }
            }).closed.then(function () {
                $scope.procurementGrid.kendoGrid.dataSource.read();
            });
        });
    }

    // 加载单条详情
    function loadCargo(billCode, cb, isAdjust) {
        var url = '';
        if (isAdjust) {
            url = '/api/bill/purchase/open?billCode=' + billCode;
        } else {
            url = '/api/bill/purchase/findPurchaseBill?billCode=' + billCode;
        }
        ApiService.get(url).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                // 详情中的货物
                var purchase = response.result.bill;
                var billDetails = purchase.billDetails;
                var cargoList = _.map(billDetails, function (item) {
                    return item.rawMaterial ? item.rawMaterial.cargo.cargoCode : '';
                });
                Common.getCargoByCodes(cargoList).then(function (cargoList) {
                    var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                        return item.cargoCode
                    }), cargoList);
                    _.each(billDetails, function (item) {
                        if (item.rawMaterial) {
                            _.extend(item, cargoObject[item.rawMaterial.cargo.cargoCode]);
                        }
                        if (!item.cargo) {
                            item.cargo = {};
                        }
                    });
                    if (!purchase.inLocation) {
                        purchase.inLocation = {};
                    }
                    // 库位
                    purchase.inStorageName = getTextByVal($scope.outType, purchase.inLocation.storage ? purchase.inLocation.storage.storageCode : '');
                    if (!purchase.supplier) {
                        purchase.supplier = {};
                    }
                    Common.getSupplierByIds([purchase.supplier.supplierCode]).then(function (suppliers) {
                        purchase.supplier.supplierName = suppliers[0] ? suppliers[0].supplierName : '';
                        cb(purchase);
                    });
                });
            }
        }, apiServiceError);
    }
});