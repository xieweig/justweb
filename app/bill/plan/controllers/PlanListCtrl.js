'use strict';

angular.module('app').controller('PlanListCtrl', function ($scope, $uibModal, $state, ApiService) {

    $scope.curAuditStatus = {};
    $scope.curSubmitStatus = {};

    // 出库查询
    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.outStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    $scope.resetPage = function () {
        $state.reload();
    };

    // 入库查询
    $scope.inStationParams = {
        callback: function (data) {
            $scope.params.inStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };
    $scope.params = {specificBillType: ''};
    $scope.search = function () {
        $scope.planList.kendoGrid.dataSource.page(1);
    };
    $scope.planList = {
        url: '/api/bill/plan/hq/findByConditions',
        params: $scope.params,
        dataSource: {
            parameterMap: function (data) {
                if (!data.outStationCodeArray) {
                    data.outStationCodeArray = 'USER_ALL'
                }
                if (!data.inStationCodeArray) {
                    data.inStationCodeArray = 'USER_ALL'
                }
                // 提交和审核状态
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
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {
                    title: "操作", width: 220,
                    command: [
                        {
                            name: 'e', text: "修改", click: editPlan,
                            visible: function (item) {
                                return item.billSubmitState === 'UNCOMMITTED';
                            }
                        },
                        // {name: 'd', text: "删除"},
                        {
                            name: 'a', text: "审核", click: auditPlan,
                            visible: function (item) {
                                return item.auditState === 'UN_REVIEWED' && item.billSubmitState === 'SUBMITTED';
                            }
                        },
                        {name: 's', text: "查看", click: lookPlan}
                    ]
                },
                {field: "billCode", title: "计划编号", width: 120},
                {field: "billName", title: "计划名称", width: 120},
                {
                    title: "计划类型", width: 120, template: function (data) {
                    return getTextByVal($scope.billType, data.billType)
                }
                },
                {field: "createTime", title: "创建时间", width: 160},
                {field: "operatorName", title: "创建人", width: 120},
                {
                    title: "提交状态", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.submitStatus, data.billSubmitState);
                    }
                },
                {
                    title: "审核状态", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.auditStatus, data.auditState);
                    }
                },
                {field: "auditorName", title: "审核人", width: 120}
            ]
        }
    };

    // 修改计划 
    function editPlan(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $state.go('app.bill.plan.edit', {billCode: dataItem.billCode});
    }

    // 审核
    function auditPlan(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/plan/modals/look.html',
            size: 'lg',
            controller: 'PlanAuditCtrl',
            resolve: {
                params: {
                    type: 'audit',
                    billCode: dataItem.billCode
                }
            }
        }).closed.then(function () {
            $scope.planList.kendoGrid.dataSource.read();
        });
    }

    // 查看
    function lookPlan(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/plan/modals/look.html',
            size: 'lg',
            controller: 'PlanAuditCtrl',
            resolve: {
                params: {
                    type: 'look',
                    billCode: dataItem.billCode
                }
            }
        }).closed.then(function () {
            $scope.planList.kendoGrid.dataSource.read();
        });
    }
});