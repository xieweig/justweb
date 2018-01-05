'use strict';

angular.module('app').controller('PlanListCtrl', function ($scope, $uibModal) {

    // 出库查询
    $scope.outStationParams = {
        callback: function (data) {
            console.log(data);
        }
    };

    // 入库查询
    $scope.inStationParams = {
        callback: function (data) {
            console.log(data);
        }
    };
    $scope.params = {};
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
                        { name: 's', text: "修改", click: editPlan },
                        { name: 's', text: "删除" },
                        { name: 'e', text: "审核", visible: function (item) { return item.receivedStatus === 'IS_NOT_RECEIVED'; } },
                        { name: 't', text: "查看", visible: function (item) { return item.receivedStatus === 'IS_NOT_RECEIVED'; } }
                    ]
                },
                { field: "billCode", title: "计划编号", width: 120 },
                { field: "billName", title: "计划名称", width: 120 },
                { field: "billType", title: "计划类型", width: 120 },
                { field: "", title: "完成度", width: 120 },
                { field: "xxxxxx", title: "创建时间", width: 160 },
                { field: "xxxxxx", title: "创建人", width: 120 },
                { field: "xxxxxx", title: "提交状态", width: 120 },
                { field: "xxxxxx", title: "审核状态", width: 120 },
                { field: "xxxxxx", title: "审核人", width: 120 }
            ]
        }
    };

    // 修改计划 
    function editPlan(e) {
        $uibModal.open({
            templateUrl: 'app/bill/plan/modals/look.html',
            size: 'lg',
            controller: 'PlanAuditCtrl'
        });
    }

});