'use strict';

angular.module('app').controller('outSearchCtrl', function ($scope, $state, $uibModal, ApiService) {
    $scope.params = {};
    $scope.kendoQueryCondition = {
        operatorName: '',
        submitStateCode: [],
        auditStateCode: [],
        inOrOutStateCode: []
    };

    $scope.submitStateCode = [
        {value: 'SAVED', text: '未提交'},
        {value: 'SUBMITTED', text: '已提交'}
    ];

    $scope.auditStateCode = [
        {value: 'OPEN', text: '未审核'},
        {value: 'AUDITSUCCESS', text: '审核通过'},
        {value: 'AUDITFAILURE', text: '审核不通过'}
    ];

    $scope.inOrOutStateCode = [
        {value: 'NOT_OUT', text: '未出库'},
        {value: 'OUT_SUCCESS', text: '出库成功'},
        {value: 'OUT_FAILURE', text: '出库失败'}
    ]

    $scope.billAttr = [
        {value: '', text: '配送计划转'},
        {value: '', text: '调剂计划转'},
        {value: '', text: '退货计划转'},
        {value: '', text: '无计划计划转'}
    ];

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

    $scope.submitState = [
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
        primaryId: 'code',
        url: '/api/bill/restock/findByConditions',
        params: $scope.kendoQueryCondition,
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
                                return true
                            }
                        }, {
                            name: 't', text: "审核", click: check, visible: function (dataItem) {
                                return true
                            }
                        }],
                    locked: true,
                    title: "操作",
                    width: 153
                },
                {
                    locked: true, title: "来源单号", width: 150, template: function (data) {
                        return '<a href="#" class="plan-btn-group">' + data.sourceCode + '</a>'
                    }
                },
                {field: "billCode", locked: true, title: "出库单号", width: 150},
                {field: "billType", title: "单据属性", width: 150},
                {
                    title: "出库状态", width: 150, template: function (data) {
                        var str = '';
                        _.each($scope.outState, function (item) {
                            if (item.value === data.inOrOutState) {
                                str = item.text
                            }
                        });
                        return str
                    }
                },
                {
                    title: "提交状态", width: 150, template: function (data) {
                        var str = '';
                        _.each($scope.submitState, function (item) {
                            if (item.value === data.submitState) {
                                str = item.text
                            }
                        });
                        return str
                    }
                },
                {
                    title: "审核状态", width: 150, template: function (data) {
                        var str = '';
                        _.each($scope.auditState, function (item) {
                            if (item.value === data.auditState) {
                                str = item.text
                            }
                        });
                        return str
                    }
                },//
                {field: "recordTime", title: "录单时间", width: 150},
                {field: "outTime", title: "出库时间", width: 150},
                {field: "outTime", title: "录单人", width: 150}, //
                {field: "outTime", title: "审核人", width: 150}, //
                {field: "amount", title: "配送数量", width: 150},
                {field: "variety", title: "配送品种数", width: 150}

            ]
        }
    };

    // 选择站点
    $scope.inStationParams = {
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.outStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 查看
    function view(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        // $state.go('app.bill.restock.outView', {outId: dataItem.outCode})
        openModal('view', dataItem)
    }

    // 修改
    function edit(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        // $state.go('app.bill.restock.outEdit', {outId: dataItem.outCode})
        openModal('edit', dataItem)
    }

    // 审核
    function check(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        // $state.go('app.bill.restock.outCheck', {outId: dataItem.outCode})
        openModal('check', dataItem)
    }

    function openModal(type, data) {
        $scope.outModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/outBillModal.html',
            size: 'lg',
            controller: 'outBillModalCtrl',
            resolve: {
                data: {
                    billCode: data.billCode,
                    type: type
                }
            }
        })
    }

    // 来源单号弹窗
    $('#grid').on('click', '.plan-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.outBillGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        // $state.go('app.bill.restock.outView', {fromId: dataItem.fromCode})
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/planView.html',
            size: 'lg',
            controller: 'PlanViewModalCtrl',
            resolve: {
                data: {
                    number: dataItem.stationPlanNum
                }
            }
        })
    });

    // 重置表格
    $scope.reset = function () {
        $scope.kendoQueryCondition = {};
        $scope.outBillGrid.kendoGrid.dataSource.data([])
    };

    // 查询
    $scope.search = function () {
        $scope.outBillGrid.kendoGrid.dataSource.page(1);
    }

    // 状态修改
    $scope.toggleSubmit = function (status, type) {
        var query = $scope.kendoQueryCondition;
        var arr = []
        if (type === 'submit') {
            arr = query.submitStateCode
        } else if (type === 'audit') {
            arr = query.auditStateCode
        } else if (type === 'out') {
            arr = query.inOrOutStateCode
        }
        var index = arr.indexOf(status)
        if (index > -1) {
            arr.splice(index, 1)
        } else {
            arr.push(status)
        }
    };
});