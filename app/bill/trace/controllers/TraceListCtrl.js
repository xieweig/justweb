'use strict';

angular.module('app').controller('TraceListCtrl', function ($scope, $uibModal, $timeout, ApiService) {
    $scope.params = {};
    // 编辑窗口的对象
    $scope.traceEdit = {};

    $scope.billStatus = [
        { value: 'IS_RECEIVED', text: '已收货' },
        { value: 'IS_NOT_RECEIVED', text: '未收货' }
    ];


    /**
     * 搜索
     */
    $scope.search = function () {
        $scope.traceGrid.kendoGrid.dataSource.page(1);
    };
    window.x=$scope.traceGrid = {
        url: '/api/bill/waybill/findWayBillByConditions',
        params: $scope.params,
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                { selectable: true },
                {
                    command: [
                        { name: 's', text: "查看", click: seeTrace },
                        {
                            name: 'e', text: "修改", click: editTrace,
                            visible: function (item) {
                                return item.receivedStatus === 'IS_NOT_RECEIVED';
                            }
                        },
                        {
                            name: 't', text: "收货",
                            click: receipt,
                            visible: function (item) {
                                return item.receivedStatus === 'IS_NOT_RECEIVED';
                            }
                        }
                    ], title: "操作", width: 220, locked: true
                },
                { field: "logisticsCompanyName", title: "物流公司", width: 120 },
                { field: "wayBillCode", title: "运单单号", width: 120 },
                { field: "outStationName", title: "出库站点", width: 120 },
                { field: "inStationName", title: "入库站点", width: 120 },
                { field: "deliveryTime", title: "发货时间", width: 120 },
                { field: "createTime", title: "录单时间", width: 120 },
                { field: "operatorName", title: "录单人", width: 120 },
                { field: "amountOfPackages", title: "运送件数", width: 120 },
                {
                    field: "outStorageBillCode", title: "运单状态", width: 120, template: function (item) {
                        return getTextByVal($scope.billStatus, item.receivedStatus);
                    }
                }
            ]
        }
    };

    // 搜索条件中的出库站点选择
    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索条件中的入库站点选择
    $scope.inStationParams = {
        callback: function (data) {
            $scope.params.outStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    /**
     * 确认收货
     */
    function receipt(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        ApiService.get('/api/bill/waybill/confirmReceiptBill?wayBillCode=' + dataItem.wayBillCode).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功', '', 'success');
                $scope.search();
            }
        }, apiServiceError);
    }

    /**
     * 查看跟踪信息
     */
    function seeTrace(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        getTraceDetails(dataItem.wayBillCode, true);
    };

    /**
     * 修改跟踪信息
     */
    function editTrace(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        getTraceDetails(dataItem.wayBillCode);
    };

    /**
     * 加载单条数据
     */
    function getTraceDetails(billCode, isRead) {
        // 打开modal
        var traceEditModal = $uibModal.open({
            templateUrl: 'app/bill/trace/modals/traceEdit.html',
            controller: 'TraceAddCtrl',
            size: 'lg',
            resolve: {
                params: {
                    billCode: billCode,
                    isRead: isRead
                }
            }
        });
    };
});