'use strict';

angular.module('app').controller('ReturnedOutStorageSearchCtrl', function ($scope, $state, $uibModal, ApiService, Common, cargoUnit, materialUnit) {
    $scope.params = {};
    $scope.cargoConfigure = cargoUnit;
    $scope.materialConfigure = materialUnit;

    $scope.kendoQueryCondition = {
        specificBillType: [],
        submitStates: [],
        auditStates: [],
        inOrOutStates: []
    };

    $scope.auditStates = [
        {value: 'UN_REVIEWED', text: '未审核'},
        {value: 'AUDIT_SUCCESS', text: '审核通过'},
        {value: 'AUDIT_FAILURE', text: '审核不通过'},
        {value: 'AUDIT_ING', text: '审核中'}
    ];

    $scope.inOrOutStates = [
        {value: 'NOT_OUT', text: '未出库'},
        {value: 'OUT_SUCCESS', text: '出库成功'},
        {value: 'OUT_FAILURE', text: '出库失败'}
    ];

    // $scope.billAttr = [
    //     {value: 'DELIVERY', text: '配送计划转'},
    //     {value: 'ADJUST', text: '调剂计划转'},
    //     {value: 'RETURNED', text: '退货计划转'},
    //     {value: 'NO_PLAN', text: '无计划计划转'}
    // ];

    // 类型存储
    $scope.outState = [
        {value: 'NOT_OUT', text: '未出库'},
        {value: 'NOT_IN', text: '未入库'},
        {value: 'IN_ING', text: '入库中'},
        {value: 'OUT_ING', text: '出库中'},
        {value: 'OUT_FAILURE', text: '出库失败'},
        {value: 'OUT_SUCCESS', text: '出库成功'},
        {value: 'IN_FAILURE', text: '入库失败'},
        {value: 'IN_SUCCESS', text: '入库成功'},
    ];

    $scope.submitStates = [
        {value: 'UNCOMMITTED', text: '未提交'},
        {value: 'SUBMITTED', text: '已提交'}
    ];

    $scope.auditState = [
        {value: 'UN_REVIEWED', text: '未审核'},
        {value: 'AUDIT_ING', text: '审核中'},
        {value: 'AUDIT_SUCCESS', text: '审核通过'},
        {value: 'AUDIT_FAILURE', text: '审核不通过'}
    ];

    $scope.outBillGrid = {
        primaryId: 'billCode',
        url: '/api/bill/returned/findOutStorageByConditions',
        params: $scope.kendoQueryCondition,
        dataSource: {
            data: function (response) {
                var data = getKendoData(response);
                var supplierCodes = [];
                _.each(data, function (item) {
                    supplierCodes.push(item.supplier.supplierCode);
                });
                // 回显供应商
                Common.getSupplierByIds(supplierCodes).then(function (supplierList) {
                    var supplierObj = _.zipObject(_.map(supplierList, function (item) {
                        return item.supplierCode;
                    }), supplierList);
                    var dataSource = $scope.outBillGrid.kendoGrid.dataSource;
                    _.each(dataSource.data(), function (item, index) {
                        var supplier = supplierObj[item.supplier.get('supplierCode')];
                        if (supplier) {
                            item.supplier.set('supplierName', supplier.supplierName);
                        } else {
                            item.supplier.set('supplierName', '');
                        }
                    });
                });
                return data
            }
        },
        kendoSetting: {
            autoBind: false,
            persistSelection: true,
            pageable: true,
            height: 300,
            columns: [
                {
                    command: [
                        {
                            name: 's', text: "查看", click: view, visible: function (dataItem) {
                                return true
                            }
                        },
                        {
                            name: 'e', text: "修改", click: edit, visible: function (dataItem) {
                                var state = dataItem.billState === 'AUDIT_FAILURE'; // 已提交，审核不通过
                                state = state || dataItem.billState === "SUBMITTED";
                                state = state || (dataItem.submitState === 'SUBMITTED' && inOrOutState === "OUT_FAILURE"); // "SUBMITTED"
                                state = state || dataItem.submitState === 'UNCOMMITTED';
                                return state
                            }
                        }, {
                            name: 't', text: "审核", click: audit, visible: function (dataItem) {
                                return dataItem.submitState === 'SUBMITTED' && (dataItem.auditState === 'UN_REVIEWED' || dataItem.auditState === 'AUDIT_ING')
                            }
                        }],
                    locked: true,
                    title: "操作",
                    width: 153
                },
                {
                    locked: true, title: "来源单号", width: 150, template: function (data) {
                        if (!data.sourceCode) {
                            data.sourceCode = ''
                        }
                        return '<a href="#" class="plan-btn-group">' + data.sourceCode + '</a>'
                    }
                },
                {field: "billCode", locked: true, title: "出库单号", width: 150},
                {
                    title: "单据属性", width: 150, template: function (data) {
                        return getTextByVal($scope.specificType, data.specificBillType) + '转'
                    }
                },
                {
                    title: "出库状态", width: 150, template: function (data) {
                        return getTextByVal($scope.outState, data.inOrOutState)
                    }
                },
                {
                    title: "提交状态", width: 150, template: function (data) {
                        return getTextByVal($scope.submitStates, data.submitState)
                    }
                },
                {
                    title: "审核状态", width: 150, template: function (data) {
                        return getTextByVal($scope.auditState, data.auditState)
                    }
                },
                {field: "createTime", title: "录单时间", width: 150},
                {field: "outWareHouseTime", title: "出库时间", width: 150},
                {field: "operatorName", title: "录单人", width: 150}, //
                {field: "auditPersonName", title: "审核人", width: 150},
                {
                    field: "outStationCode", title: "出库站点", width: 150, template: function (data) {
                        return getTextByVal($scope.station, data.outLocation.stationCode)
                    }
                },
                {
                    title: "入库站点", width: 150, template: function (data) {
                        return data.supplier.supplierName
                    }
                },
                {field: "totalAmount", title: "配送数量", width: 150},
                {field: "totalVarietyAmount", title: "配送品种数", width: 150}

            ]
        }
    };

    // 选择站点
    $scope.inStationParams = {
        type: 'supplier',
        callback: function (data) {
            $scope.params.inStationCodes = _.map(data, function (item) {
                return item.supplierCode;
            });
        }
    };

    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.outStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 查看
    function view(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        openModal('view', dataItem)
    }

    // 修改
    function edit(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        openModal('edit', dataItem)
    }

    // 审核
    function audit(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        openModal('audit', dataItem)
    }

    function openModal(type, data) {
        $scope.outModal = $uibModal.open({
            templateUrl: 'app/bill/returned/modals/outStorageBillModal.html',
            size: 'lg',
            controller: 'ReturnedOutStorageModalCtrl',
            // scope: $scope,
            resolve: {
                data: {
                    billCode: data.billCode,
                    type: type,
                    cargoUnit: $scope.cargoConfigure,
                    materialUnit: $scope.materialConfigure
                }
            }
        });
        $scope.outModal.closed.then(function () {
            $scope.search();
        });
    }

    // 来源单号弹窗
    $('#grid').on('click', '.plan-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.outBillGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/returned/modals/planView.html',
            size: 'lg',
            controller: 'ReturnedPlanViewModalCtrl',
            resolve: {
                data: {
                    billCode: dataItem.sourceCode
                }
            }
        });
        $scope.addModal.closed.then(function () {
            $scope.search();
        });
    });

    // 重置表格
    $scope.reset = function () {
        $state.reload($state.current.name)
    };

    // 查询
    $scope.search = function () {
        $scope.outBillGrid.kendoGrid.dataSource.page(1);
    };

    // 状态修改
    $scope.toggleSubmit = function (status, type) {
        var query = $scope.kendoQueryCondition;
        var arr = [];
        if (type === 'submit') {
            arr = query.submitStates
        } else if (type === 'audit') {
            arr = query.auditStates
        } else if (type === 'out') {
            arr = query.inOrOutStates
        }
        var index = arr.indexOf(status);
        if (index > -1) {
            arr.splice(index, 1)
        } else {
            arr.push(status)
        }
    };
});