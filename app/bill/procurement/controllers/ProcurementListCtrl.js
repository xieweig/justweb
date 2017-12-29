'use strict';

angular.module('app').controller('ProcurementListCtrl', function ($scope) {
    $scope.submitStatus = [
        { value: '', text: '已提交' },
        { value: '', text: '未提交' }
    ];
    $scope.auditStatus = [
        { value: '', text: '未审核' },
        { value: '', text: '审核通过' },
        { value: '', text: '审核不通过' }
    ];


    // 表格参数及搜索
    $scope.params = {};
    $scope.search = function () {
        $scope.procurementGrid.kendoGrid.dataSource.page(1);
    }
    $scope.procurementGrid = {
        url: '/api/baseInfo/cargo/findByCondition',
        params: $scope.params,
        dataSource: {
            data: function () {
                return [
                    { audit: false, submit: true },
                    { audit: true, submit: true },
                    { audit: false, submit: false },
                    { audit: true, submit: true }
                ];
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                { selectable: true },
                {
                    title: "操作", width: 160,
                    command: [
                        {
                            name: 't', text: "查看",
                            click: function (e) {
                                e.preventDefault();
                                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            }
                        },
                        {
                            name: 'e', text: "修改",
                            click: function (e) {
                                e.preventDefault();
                                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            },
                            visible: function (dataItem) { return !dataItem.submit; }
                        },
                        {
                            name: 'e', text: "审核",
                            click: function (e) {
                                e.preventDefault();
                                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            },
                            visible: function (dataItem) { return dataItem.submit && !dataItem.audit; }
                        }
                    ]
                },
                { field: "logisticsCompanyName", title: "物流公司", width: 120 },
                { field: "wayBillCode", title: "运单单号", width: 120 },
                { field: "outStationCode", title: "出库站点", width: 120 },
                { field: "inStationCode", title: "入库站点", width: 120 },
                { field: "deliveryTime", title: "发货时间", width: 120 },
                { field: "createTime", title: "录单时间", width: 120 },
                { field: "operatorName", title: "录单人", width: 120 },
                { field: "amountOfPackages", title: "运送件数", width: 120 },
                { field: "outStorageBillCode", title: "运单状态", width: 120 }
            ]
        }
    };
});