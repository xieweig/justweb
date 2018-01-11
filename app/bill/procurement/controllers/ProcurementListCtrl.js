'use strict';

angular.module('app').controller('ProcurementListCtrl', function ($scope, $uibModal, ApiService, Common) {


    // 表格参数及搜索
    $scope.params = {};
    $scope.curSubmitStatus = {};
    $scope.curAuditStatus = {};
    $scope.search = function () {
        $scope.procurementGrid.kendoGrid.dataSource.page(1);
    };
    $scope.procurementGrid = {
        url: '/api/bill/purchase/findByConditions',
        params: $scope.params,
        dataSource: {
            parameterMap: function (params) {
                params.submitStatus = [];
                _.each($scope.curSubmitStatus, function (item, key) {
                    if (item) {
                        params.submitStatus.push(key);
                    }
                });
                params.auditStatus = [];
                _.each($scope.curAuditStatus, function (item, key) {
                    if (item) {
                        params.auditStatus.push(key);
                    }
                });
            }
        },
        kendoSetting: {
            // autoBind: false,
            pageable: true,
            columns: [
                {
                    title: "操作", width: 220, locked: true,
                    command: [
                        {name: 't', text: "查看", click: openViewModal},
                        {
                            name: 'e', text: "修改",
                            click: openEditModal,
                            visible: function (dataItem) {
                                return dataItem.submitState !== 'SUBMITTED';
                            }
                        },
                        {
                            name: 'audit', text: "审核",
                            click: openAuditModal,
                            visible: function (dataItem) {
                                return dataItem.auditState === 'UN_REVIEWED' && dataItem.submitState === 'SUBMITTED';
                            }
                        }
                    ]
                },
                {field: "billCode", title: "单号", width: 120},
                {field: "inWareHouseTime", title: "入库时间", width: 120},
                {field: "createTime", title: "录单时间", width: 120},
                {field: "operatorCode", title: "录单人", width: 120},
                {field: "auditPersonCode", title: "审核人", width: 120},
                {field: "inStationCode", title: "入库站点", width: 120},
                {field: "inStorageCode", title: "入库库房", width: 120},
                {field: "amount", title: "实收数量", width: 120},
                {field: "differenceNumber", title: "数量差值", width: 120},
                {field: "inTotalPrice", title: "进货实洋", width: 120},
                {field: "differencePrice", title: "总价值差", width: 120},
                {field: "supplierCode", title: "供应商", width: 120},
                {
                    title: "提交状态", width: 120, template: function (data) {
                    return getTextByVal($scope.auditStatus, data.auditState);
                }
                },
                {
                    title: "审核状态", width: 120, template: function (data) {
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
                        purchaseBill: purchaseBill
                    }
                }
            }).closed.then(function () {
                $scope.search();
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
                        purchaseBill: purchaseBill
                    }
                }
            }).closed.then(function () {
                $scope.search();
            });
        });
    };

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
                    }
                }
            }).closed.then(function () {
                $scope.search();
            });
        });
    };

    // 加载单条详情
    function loadCargo(billCode, cb) {
        ApiService.get('/api/bill/purchase/findByPurchaseBillCode?purchaseBillCode=' + billCode).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                var billDetails = response.result.purchaseBill.billDetails;
                var cargoList = _.map(billDetails, function (item) {
                    return item.rawMaterial ? item.rawMaterial.cargo.cargoCode : '';
                });
                Common.getCargoByCodes(cargoList).then(function (cargoList) {
                    var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                        return item.cargoCode
                    }), cargoList);
                    _.each(billDetails, function (item) {
                        if (item.rawMaterial) {
                            item.cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                        }
                        if (!item.cargo) {
                            item.cargo = {};
                        }
                        item.cargoCode = generateMixed(10); //item.cargo.cargoCode;
                    });
                    cb(response.result.purchaseBill);
                });
            }
        }, apiServiceError);
    };
});