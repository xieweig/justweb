'use strict';

angular.module('app').controller('AdjustOutStorageListCtrl', function ($scope, $state, ApiService, $timeout, $uibModal, cargoUnit, materialUnit) {
    $scope.params = {};
    $scope.curSubmitStatus = {};
    $scope.curAuditStatus = {};
    $scope.curOutStatus = {};

    $scope.sourceBillType = [
        {key: 'ADJUST', value: 'ADJUST', text: '调剂计划'},
        {key: 'NO_PLAN', value: 'NO_PLAN', text: '无计划'}
    ];

    // 搜索条件中的出库站点选择
    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.outStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索条件中的入库站点选择
    $scope.inStationParams = {
        callback: function (data) {
            $scope.params.inStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };
    // 重置页面
    $scope.resetPage = function () {
        $state.reload($state.current.name);
    };

    $scope.search = function () {
        $scope.billGrid.kendoGrid.dataSource.page(1);
    };
    $scope.billGrid = {
        url: '/api/bill/adjust/findOutStorageByConditions',
        params: $scope.params,
        dataSource: {
            parameterMap: function (data) {
                if (!data.outStationCodes || data.outStationCodes.length === 0) {
                    data.outStationCodes = ['USER_ALL'];
                }
                if (!data.inStationCodes || data.inStationCodes.length === 0) {
                    data.inStationCodes = ['USER_ALL'];
                }


                data.submitStates = [];
                _.each($scope.curSubmitStatus, function (item, key) {
                    if (item) {
                        data.submitStates.push(key);
                    }
                });
                data.auditStates = [];
                _.each($scope.curAuditStatus, function (item, key) {
                    if (item) {
                        data.auditStates.push(key);
                    }
                });
                data.inOrOutStates = [];
                _.each($scope.curOutStatus, function (item, key) {
                    if (item) {
                        data.inOrOutStates.push(key);
                    }
                });
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            height: 500,
            columns: [
                {
                    title: '操作',
                    width: 220,
                    locked: true,
                    command: [
                        {name: 'l', text: "查看", click: lookDetails},
                        {
                            name: 'u', text: "修改", click: updateDetails,
                            visible: function (dataItem) {
                                return dataItem.billState === 'AUDIT_FAILURE'
                                    || dataItem.billState === "SUBMITTED"
                                    || (dataItem.submitState === 'SUBMITTED'
                                    && dataItem.inOrOutState === "OUT_FAILURE")
                                    || dataItem.submitState === 'UNCOMMITTED';
                            }
                        },
                        {
                            name: 'a', text: "审核", click: audit,
                            visible: function (dataItem) {
                                return dataItem.submitState === 'SUBMITTED'
                                    && (dataItem.auditState === 'UN_REVIEWED'
                                    || dataItem.auditState === 'AUDIT_ING');
                            }
                        }
                    ]
                },
                {
                    title: "单据属性", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.sourceBillType, data.sourceBillType)
                    }
                },
                {
                    title: "出库状态", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.outboundStatus, data.inOrOutState);
                    }
                },
                {
                    title: "提交状态", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.submitStatus, data.submitState);
                    }
                },
                {
                    title: "审核状态", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.auditStatus, data.auditState);
                    }
                },
                {title: "来源单号", width: 250, template: '<a href="javascript:void(0);" class="sourceCode">#: data.sourceCode || "" #</a>'},
                {field: "billCode", title: "出库单号", width: 200},
                {field: "createTime", title: "录单时间", width: 160},
                {field: "outWareHouseTime", title: "出库时间", width: 120},
                {field: "operatorName", title: "录单人", width: 120},
                {field: "auditPersonName", title: "审核人", width: 120},
                {
                    title: "出库站点", width: 200,
                    template: function (data) {
                        if (data.outLocation) {
                            return getTextByVal($scope.station, data.outLocation.stationCode);
                        }
                        return '-';
                    }
                },
                {
                    title: "入库站点", width: 200,
                    template: function (data) {
                        if (data.inLocation) {
                            return getTextByVal($scope.station, data.inLocation.stationCode);
                        }
                        return '-';
                    }
                },
                {field: "totalAmount", title: "出库数量", width: 120},
                {field: "totalVarietyAmount", title: "出库品种数", width: 120}
            ]
        }
    };

    // 点击来源单号的事件
    $('#billGrid').on('click', '.sourceCode', function (e) {
        var dataItem = $scope.billGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/billDetails.html',
            size: 'lg',
            scope: $scope,
            controller: 'AdjustPlanDetailsCtrl',
            resolve: {
                params: {
                    billCode: dataItem.sourceCode,
                    cargoUnit: cargoUnit
                }
            }
        });
    });


    // 查看详情
    function lookDetails(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        loadBillDetails('outLook', dataItem.billCode);
    }

    // 查看详情
    function updateDetails(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        loadBillDetails('update', dataItem.billCode);
    }

    // 查看详情
    function audit(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        // 设置状态为审核中
        ApiService.get('/api/bill/adjust/open?billCode=' + dataItem.billCode).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                loadBillDetails('audit', dataItem.billCode);
            }
        }, apiServiceError);
    }

    // 加载出库单详情
    function loadBillDetails(type, billCode) {
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/details.html',
            size: 'lg',
            scope: $scope,
            controller: 'AdjustDetailsCtrl',
            resolve: {
                params: {
                    type: type,
                    billCode: billCode,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit
                }
            }
        }).closed.then(function () {
            $scope.billGrid.kendoGrid.dataSource.read();
        });
    }
});