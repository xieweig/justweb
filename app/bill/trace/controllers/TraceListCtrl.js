'use strict';

angular.module('app').controller('TraceListCtrl', function ($scope, $uibModal, $timeout, ApiService) {
    $scope.params = {};
    // 编辑窗口的对象
    $scope.traceEdit = {};

    $scope.packageType = [
        { value: 'ONE_BILL_TO_ONE_PACKAGE', text: '一单一包' },
        { value: 'ONE_BILL_TO_MANY_PACKAGE', text: '一单多包' },
        { value: 'MANY_BILL_TO_ONE_PACKAGE', text: '多单合包' }
    ];
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
    $scope.traceGrid = {
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
                    ], title: "操作", width: 220
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
     * 增加跟踪信息
     */
    $scope.addTrace = function () {
        // 初始化参数
        $scope.traceEdit.trace = {};
        initTraceEdit();
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
    function getTraceDetails(id, isRead) {
        ApiService.get('/api/bill/waybill/findOneWayBill?id=' + id).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                // 初始化参数
                $scope.traceEdit.trace = response.result.wayBill;
                $scope.traceEdit.trace.isRead = isRead;
                initTraceEdit(isRead);
                $scope.traceEdit.traceEditModal.rendered.then(function () {
                    $timeout(function () {
                        $scope.traceEdit.detailsGrid.kendoGrid.dataSource.data($scope.traceEdit.trace.editWayBillDetailDTOList);
                    });
                });
            }
        });
    };

    /**
     * 初始化
     */
    function initTraceEdit(isRead) {
        $scope.traceEdit.detailsGrid = {
            primaryId: 'outStorageBillCode',
            kendoSetting: {
                editable: true,
                autoBind: false,
                persistSelection: true,
                columns: [
                    { field: "outStorageBillCode", title: "出库单号", width: 120 },
                    { title: "所属包号", width: 120, template: '#: packageNumbers #' },
                    { field: "outStationCode", title: "出库站点", width: 120 },
                    { field: "inStationCode", title: "入库站点", width: 120 },
                    { field: "outStorageTime", title: "出库时间", width: 150 },
                    { field: "operatorName", title: "录单人", width: 120 },
                    { field: "totalCount", title: "品种数", width: 120 },
                    { field: "totalAmount", title: "货物数", width: 120 }
                ]
            }
        };
        if (!isRead) {
            $scope.traceEdit.detailsGrid.kendoSetting.columns.splice(0, 0, { selectable: true });
        }

        /**
         * 打开增加货单明细modal
         */
        $scope.traceEdit.showAddModal = function () {
            $scope.traceEdit.currentDetails = {};
            $scope.traceEdit.addModal = $uibModal.open({
                templateUrl: 'app/bill/trace/modals/traceDetails.html',
                scope: $scope,
                size: 'lg'
            });
        }


        /**
         * 编辑货物中的包选择
         */
        $scope.packageMap = [{ text: '' }];
        $scope.packageTypeChange = function () {
            $scope.packageMap = [{ text: '' }];
        }
        $scope.addPackageMap = function () {
            $scope.packageMap.push({ text: '' });
        }

        // 搜索条件中的出库站点选择
        $scope.traceEdit.outStationParams = {
            single: true,
            initTip: $scope.traceEdit.trace.outStationCode,
            callback: function (data) {
                $scope.traceEdit.trace.outStationCode = data.stationCode;
            }
        };

        // 搜索条件中的入库站点选择
        $scope.traceEdit.inStationParams = {
            single: true,
            initTip: $scope.traceEdit.trace.inStationCode,
            callback: function (data) {
                $scope.traceEdit.trace.inStationCode = data.stationCode;
            }
        };

        /**
         * 增加一条明细
         * @param {*是否点击的下一条 如果点击的下一条需要清空表格数据} isNext 
         */
        $scope.traceEdit.addDetails = function (isNext) {
            // 判断所属包号是否填写完整
            var packageNumbersPass = true;
            // 所属包号
            var packageNumbers = [];
            _.find($scope.packageMap, function (item) {
                if (!item.text) {
                    packageNumbersPass = false;
                } else {
                    packageNumbers.push(item.text);
                }
                return !item.text;
            });
            if (packageNumbers.length === 0) {
                packageNumbersPass = false;
            } else {
                $scope.traceEdit.currentDetails.packageNumbers = packageNumbers.join();
            }

            // 假数据
            // $scope.traceEdit.currentDetails = { "operatorName": "213", "packageType": "ONE_BILL_TO_MANY_PACKAGE", "packageNumbers": ["12", "213", "213"], "totalCount": "12", "totalAmount": "12", "inStationCode": "PEKC03", "outStationCode": "NKGA03", "outStorageTime": "2017-12-13 10:06:16" };
            // $scope.traceEdit.currentDetails.outStorageBillCode = generateMixed(10);

            if (!$scope.traceEdit || !$scope.traceEdit.currentDetails) {
                swal('请输入填写单据详情', '', 'warning');
            } else if (!$scope.traceEdit.currentDetails.outStorageBillCode) {
                swal('请输入出库单号', '', 'warning');
            } else if (!$scope.traceEdit.currentDetails.operatorName) {
                swal('请输入录单人', '', 'warning');
            } else if (!$scope.traceEdit.currentDetails.packageType) {
                swal('请选择是否单独打包', '', 'warning');
            } else if (!packageNumbersPass) {
                swal('请填写所属包号', '', 'warning');
            } else if (!$scope.traceEdit.currentDetails.totalCount) {
                swal('请输入品种数', '', 'warning');
            } else if (!$scope.traceEdit.currentDetails.totalAmount) {
                swal('请输入货物数', '', 'warning');
            } else if (!$scope.traceEdit.currentDetails.outStorageTime) {
                swal('请输入出库时间', '', 'warning');
            } else {
                var dataSource = $scope.traceEdit.detailsGrid.kendoGrid.dataSource;
                var repeatIndex = _.findIndex(dataSource.data(), function (item) {
                    return item.outStorageBillCode == $scope.traceEdit.currentDetails.outStorageBillCode;
                });
                if (repeatIndex >= 0) {
                    swal('该出库单号已存在', '', 'warning');
                    return true;
                }
                dataSource.add($scope.traceEdit.currentDetails);
                $scope.traceEdit.currentDetails = {};
                if (!isNext) {
                    $scope.traceEdit.addModal.close();
                }
            }
        }


        /** 
         * 保存运单
        */
        $scope.traceEdit.save = function () {
            if (!$scope.traceEdit || !$scope.traceEdit.trace) {
                swal('请输入填写单据详情', '', 'warning');
            } else if (!$scope.traceEdit.trace.wayBillCode) {
                swal('请输入运单单号', '', 'warning');
            } else if (!$scope.traceEdit.trace.deliveryTime) {
                swal('请输入发货时间', '', 'warning');
            } else if (!$scope.traceEdit.trace.planArrivalTime) {
                swal('请输入预计到货时间', '', 'warning');
            } else if (!$scope.traceEdit.trace.logisticsCompanyName) {
                swal('请输入物流公司', '', 'warning');
            } else if (!$scope.traceEdit.trace.outStationCode) {
                swal('请输入出库站点', '', 'warning');
            } else if (!$scope.traceEdit.trace.inStationCode) {
                swal('请输入入库站点', '', 'warning');
            } else if (!$scope.traceEdit.trace.amountOfPackages) {
                swal('请输入运送件数', '', 'warning');
            } else {
                // 获取运单明细
                $scope.traceEdit.trace.editWayBillDetailDTOList = [];
                var repeatMessage = '';
                // 循环表格获取出入库单据
                _.find($scope.traceEdit.detailsGrid.kendoGrid.dataSource.data(), function (item) {
                    if (item.outStationCode && $scope.traceEdit.trace.outStationCode !== item.outStationCode) {
                        repeatMessage = '存在出库站点不一致的单据';
                        return true;
                    } else if (item.inStationCode && $scope.traceEdit.trace.inStationCode !== item.inStationCode) {
                        repeatMessage = '存在入库站点不一致的单据';
                        return true;
                    }
                    $scope.traceEdit.trace.editWayBillDetailDTOList.push({
                        outStorageBillCode: item.outStorageBillCode,
                        operatorName: item.operatorName,
                        packageType: item.packageType,
                        packageNumbers: item.packageNumbers,
                        totalCount: item.totalCount,
                        totalAmount: item.totalAmount,
                        outStationCode: item.outStationCode,
                        inStationCode: item.inStationCode,
                        outStorageTime: item.outStorageTime
                    });
                    return false;
                });
                if (repeatMessage) {
                    swal(repeatMessage, '', 'warning');
                } else {
                    saveTrace($scope.traceEdit.trace);
                }
            }
        }

        // 保存trace
        function saveTrace(trace) {
            var url = '';
            if (!trace.billId) {
                url = '/api/bill/waybill/createWayBill';
            } else {
                url = '/api/bill/waybill/updateWayBill';
            }
            ApiService.post(url, trace).then(function (response) {
                if (response.code !== '000') {
                    swal('', response.message, 'error');
                } else {
                    swal('操作成功! ', '', 'success').then(function () {
                        $scope.traceEdit.traceEditModal.close();
                        $scope.search();
                    });
                }
            }, apiServiceError);
        }

        /**
         * 删除
         */
        $scope.traceEdit.deleteDetails = function () {
            var selectIds = $scope.traceEdit.detailsGrid.kendoGrid.selectedKeyNames();
            var dataSource = $scope.traceEdit.detailsGrid.kendoGrid.dataSource;
            var indexPos = _.chain(dataSource.data()).map(function (item, index) {
                if (_.indexOf(selectIds, item.outStorageBillCode) > -1) {
                    return index;
                }
            }).reverse().value();

            // 根据反序  从最后一条开始删除
            _.each(indexPos, function (item) {
                if (_.isNumber(item) && item >= 0) {
                    dataSource.remove(dataSource.at(item));
                }
            });
        }

        // 打开modal
        $scope.traceEdit.traceEditModal = $uibModal.open({
            templateUrl: 'app/bill/trace/modals/traceEdit.html',
            scope: $scope,
            size: 'lg'
        });
    }
});