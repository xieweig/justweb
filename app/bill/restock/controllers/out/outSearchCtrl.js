'use strict';

angular.module('app').controller('outSearchCtrl', function ($scope, $state, $uibModal, ApiService) {
    $scope.params = {};
    $scope.kendoQueryCondition = {
        operatorName: ''
    };

    $scope.submitStatus = [
        {value: '', text: '已提交'},
        {value: '', text: '未提交'}
    ];

    $scope.auditStatus = [
        {value: '', text: '未审核'},
        {value: '', text: '审核通过'},
        {value: '', text: '审核不通过'}
    ];

    $scope.billAttr = [
        {value: '', text: '配送计划转'},
        {value: '', text: '调剂计划转'},
        {value: '', text: '退货计划转'},
        {value: '', text: '无计划计划转'}
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
                    field: "fromCode", locked: true, title: "来源单号", width: 150, template: function (data) {
                        return '<a href="#" class="plan-btn-group">' + data.fromCode + '</a>'
                    }
                },
                {field: "billCode", locked: true, title: "出库单号", width: 150},
                {field: "billType", title: "单据属性", width: 150},
                {field: "outStatus", title: "出库状态", width: 150},
                {field: "inputStatus", title: "提交状态", width: 150},
                {field: "checkStatus", title: "审核状态", width: 150},
                {field: "recordTime", title: "录单时间", width: 150},
                {field: "outTime", title: "出库时间", width: 150},
                {field: "outTime", title: "录单人", width: 150},
                {field: "outTime", title: "审核人", width: 150},
                {field: "totalAmount", title: "配送数量", width: 150},
                {field: "typeAmount", title: "配送品种数", width: 150}

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
        // console.log($scope.kendoQueryCondition)
        // ApiService.get('http://127.0.0.1:5000/api/bill/restock/out/search', {hasHost: true}).then(function (response) {
        //     if (response.code === '000') {
        //         _.each(response.result.content, function (item) {
        //             var dataSource = $scope.outBillGrid.kendoGrid.dataSource;
        //             dataSource.add({
        //                 billType: item.billType,
        //                 outStatus: item.outStatus,
        //                 inputStatus: item.inputStatus,
        //                 checkStatus: item.checkStatus,
        //                 fromCode: item.fromCode,
        //                 outCode: item.outCode,
        //                 recordTime: item.recordTime,
        //                 outTime: item.outTime
        //             })
        //         })
        //
        //     } else {
        //         swal('请求失败', response.message, 'error');
        //     }
        // }, apiServiceError)
    }
});