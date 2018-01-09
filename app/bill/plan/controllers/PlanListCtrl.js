'use strict';

angular.module('app').controller('PlanListCtrl', function ($scope, $uibModal, $state, ApiService) {

    // 出库查询
    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.outStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 入库查询
    $scope.inStationParams = {
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };
    $scope.params = {hqBill: true};
    $scope.search = function () {
        $scope.planList.kendoGrid.dataSource.page(1);
    };
    $scope.planList = {
        url: '/api/bill/planBill/hq/findPlanBillByConditions',
        params: $scope.params,
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {
                    title: "操作", width: 220, locked: true,
                    command: [
                        {
                            name: 'e', text: "修改", click: editPlan,
                            visible: function (item) {
                                return item.billSubmitState === 'UNCOMMITTED';
                            }
                        },
                        {name: 'd', text: "删除"},
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
                {field: "billType", title: "计划类型", width: 120},
                {field: "", title: "完成度", width: 120},
                {field: "createTime", title: "创建时间", width: 160},
                {field: "operatorName", title: "创建人", width: 120},
                {field: "billSubmitState", title: "提交状态", width: 120},
                {field: "auditState", title: "审核状态", width: 120},

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
        });
    }
});