'use strict';

angular.module('app').controller('TraceListCtrl', function ($scope, $uibModal, ApiService) {
    $scope.params = {};
    // 编辑窗口的对象
    $scope.traceEdit = {};
    /**
     * 搜索
     */
    $scope.search = function () {
        $scope.traceGrid.kendoGrid.dataSource.page(1);
    };
    $scope.traceGrid = {
        url: '/api/baseInfo/cargo/findByCondition',
        params: $scope.params,
        dataSource: {
            data: function () {
                return [
                    {
                        code: 1,
                        logisticsCompany: '物流公司',
                        oddNumber: '物流公司',
                        outboundStation: '出库站点',
                        inboundStation: '入库站点',
                        deliveryTime: '发货时间',
                        recordTime: '录单时间',
                        recordSingle: '录单人',
                        number: '运送件数',
                        status: '运单状态',
                    }
                ];
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                { selectable: true },
                { command: [{ name: 's', text: "查看", click: seeTrace }, { name: 'e', text: "修改", click: editTrace }, { name: 't', text: "收货" }], title: "操作", width: 180 },
                { field: "logisticsCompany", title: "物流公司", width: 120 },
                { field: "oddNumber", title: "运单单号", width: 120 },
                { field: "outboundStation", title: "出库站点", width: 120 },
                { field: "inboundStation", title: "入库站点", width: 120 },
                { field: "deliveryTime", title: "发货时间", width: 120 },
                { field: "recordTime", title: "录单时间", width: 120 },
                { field: "recordSingle", title: "录单人", width: 120 },
                { field: "number", title: "运送件数", width: 120 },
                { field: "status", title: "运单状态", width: 120 }
            ]
        }
    };

    $scope.outStationParams = {
        // single: true,
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    $scope.inStationParams = {
        // single: true,
        callback: function (data) {
            $scope.params.outStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    /**
     * 增加跟踪信息
     */
    $scope.addTrace = function () {
        // 初始化参数
        $scope.traceEdit.trace = {};
        initTraceEdit();
    };

    /**
     * 查看跟踪信息
     */
    function seeTrace(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        getTraceDetails(dataItem.code, true);
    };

    /**
     * 查看跟踪信息
     */
    function editTrace(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        getTraceDetails(dataItem.code);
    };

    /**
     * 加载单条数据
     */
    function getTraceDetails(id, isRead) {
        ApiService.get('/api/baseInfo/configure/findByConfigureType?configureType=CARGO_UNIT&id=' + id).then(function () {
            // 初始化参数
            $scope.traceEdit.trace = {
                code: 1,
                logisticsCompany: '物流公司',
                oddNumber: '单号',
                outboundStation: '出库站点',
                inboundStation: '入库站点',
                deliveryTime: '发货时间',
                recordTime: '录单时间',
                recordSingle: '录单人',
                number: '运送件数',
                status: '运单状态',
            };
            initTraceEdit();
        });
    };

    /**
     * 初始化
     */
    function initTraceEdit() {
        $scope.traceEdit.detailsGrid = {
            primaryId: 'sn',
            kendoSetting: {
                editable: true,
                autoBind: false,
                persistSelection: true,
                columns: [
                    { selectable: true },
                    { field: "sn", title: "出库单号", width: 120 },
                    { field: "inStationName", title: "所属包号", width: 120 },
                    { field: "inStationName", title: "出库站点", width: 120 },
                    { field: "inStationName", title: "入库站点", width: 120 },
                    { field: "inStationName", title: "出库时间", width: 120 },
                    { field: "inStationName", title: "录单人", width: 120 },
                    { field: "inStationName", title: "品种数", width: 120 },
                    { field: "inStationName", title: "货物数", width: 120 },
                    { command: [{ name: 'destroy', text: "删除" }], title: "操作", width: 155 }
                ]
            }
        };

        /**
         * 打开增加货单明细modal
         */
        $scope.traceEdit.showAddModal = function () {
            $scope.traceEdit.currentDetails = { sn: 1 };
            $scope.traceEdit.addModal = $uibModal.open({
                templateUrl: 'app/bill/trace/modals/traceDetails.html',
                scope: $scope,
                size: 'lg'
            });
        }

        /**
         * 增加一条明细
         * @param {*是否点击的下一条 如果点击的下一条需要清空表格数据} isNext 
         */
        $scope.traceEdit.addDetails = function (isNext) {
            if (!$scope.traceEdit.currentDetails.sn) {
                swal('请输入出库单号', '', 'warning');
                return;
            }
            var dataSource = $scope.traceEdit.detailsGrid.kendoGrid.dataSource;
            var repeatIndex = _.findIndex(dataSource.data(), function (item) {
                return item.sn == $scope.traceEdit.currentDetails.sn;
            });
            if (repeatIndex >= 0) {
                swal('该出库单号已存在', '', 'warning');
                return true;
            }
            dataSource.add($scope.traceEdit.currentDetails);
            $scope.currentDetails = {};
            if (!isNext) {
                $scope.traceEdit.addModal.close();
            }
        }

        /**
         * 删除
         */
        $scope.traceEdit.deleteDetails = function () {
            var selectIds = $scope.traceEdit.detailsGrid.kendoGrid.selectedKeyNames();
            alert('将要删除' + selectIds);
        }
        // 打开modal
        $scope.traceEditModal = $uibModal.open({
            templateUrl: 'app/bill/trace/modals/traceEdit.html',
            scope: $scope,
            size: 'lg'
        });
    }
});