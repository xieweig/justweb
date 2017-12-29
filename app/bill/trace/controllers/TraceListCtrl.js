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
                        logisticsCompanyName: '物流公司',
                        wayBillCode: '运单单号',
                        outStationCode: '出库站点',
                        inStationCode: '入库站点',
                        deliveryTime: '发货时间',
                        createTime: '录单时间',
                        operatorName: '录单人',
                        amountOfPackages: '运送件数',
                        outStorageBillCode: '运单状态',
                    }
                ];
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                { selectable: true },
                { command: [{ name: 's', text: "查看", click: seeTrace }, { name: 'e', text: "修改", click: editTrace }, { name: 't', text: "收货" }], title: "操作", width: 220 },
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
        ApiService.get('/api/baseInfo/configure/findByConfigureType?configureType=CARGO_UNIT&id=' + id).then(function () {
            // 初始化参数
            $scope.traceEdit.trace = {
                wayBillCode: '单号',
                deliveryTime: '发货时间',
                planArrivalTime: '预计到货时间',
                logisticsCompanyName: '物流公司',
                amountOfPackages: '运送件数',
                totalWeight: '总重量',
                memo: '备注',
                destination: '目的地',
                editWayBillDetailDTOList: [
                    { "outStorageBillCode": "21132132165da", "operatorName": "213", "packageType": "ONE_BILL_TO_MANY_PACKAGE", "packageNumbers": ["12", "213", "213"], "totalCount": "12", "totalAmount": "12", "inStationCode": "PEKC03", "outStationCode": "NKGA03", "outStorageTime": "2017-12-13 10:06:16" }
                ],
            };
            initTraceEdit();
            $scope.traceEdit.traceEditModal.rendered.then(function () {
                $timeout(function () {
                    $scope.traceEdit.detailsGrid.kendoGrid.dataSource.data($scope.traceEdit.trace.editWayBillDetailDTOList);
                });
            });
        });
    };

    /**
     * 初始化
     */
    function initTraceEdit() {
        $scope.traceEdit.detailsList = [];
        $scope.traceEdit.detailsGrid = {
            primaryId: 'outStorageBillCode',
            kendoSetting: {
                editable: true,
                autoBind: false,
                persistSelection: true,
                columns: [
                    { selectable: true },
                    { field: "outStorageBillCode", title: "出库单号", width: 120 },
                    { field: "packageNumbers.join()", title: "所属包号", width: 120 },
                    { field: "outStationCode", title: "出库站点", width: 120 },
                    { field: "inStationCode", title: "入库站点", width: 120 },
                    { field: "outStorageTime", title: "出库时间", width: 150 },
                    { field: "operatorName", title: "录单人", width: 120 },
                    { field: "totalCount", title: "品种数", width: 120 },
                    { field: "totalAmount", title: "货物数", width: 120 }
                ]
            }
        };

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
            button: true,
            callback: function (data) {
                $scope.traceEdit.currentDetails.outStationCode = data.stationCode;
                $scope.traceEdit.currentDetails.outStationName = data.stationName;
            }
        };

        // 搜索条件中的入库站点选择
        $scope.traceEdit.inStationParams = {
            single: true,
            callback: function (data) {
                $scope.traceEdit.currentDetails.inStationCode = data.stationCode;
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
            $scope.traceEdit.currentDetails.packageNumbers = [];
            _.find($scope.packageMap, function (item) {
                if (!item.text) {
                    packageNumbersPass = false;
                } else {
                    $scope.traceEdit.currentDetails.packageNumbers.push(item.text);
                }
                return !item.text;
            });
            if ($scope.traceEdit.currentDetails.packageNumbers.length === 0) {
                packageNumbersPass = false;
            }

            // 假数据
            $scope.traceEdit.currentDetails = { "operatorName": "213", "packageType": "ONE_BILL_TO_MANY_PACKAGE", "packageNumbers": ["12", "213", "213"], "totalCount": "12", "totalAmount": "12", "inStationCode": "PEKC03", "outStationCode": "NKGA03", "outStorageTime": "2017-12-13 10:06:16" };
            $scope.traceEdit.currentDetails.outStorageBillCode = generateMixed(10);
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
            } else if (!$scope.traceEdit.currentDetails.outStationCode) {
                swal('请输入出库站点', '', 'warning');
            } else if (!$scope.traceEdit.currentDetails.inStationCode) {
                swal('请输入入库站点', '', 'warning');
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
                $scope.traceEdit.detailsList.push($scope.traceEdit.currentDetails);
                dataSource.data($scope.traceEdit.detailsList);
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
            } else if (!$scope.traceEdit.trace.amountOfPackages) {
                swal('请输入运送件数', '', 'warning');
            } else if (!$scope.traceEdit.trace.totalWeight) {
                swal('请输入总重量', '', 'warning');
            } else {
                // 获取运单明细
                var inStationCode = '';
                $scope.traceEdit.trace.editWayBillDetailDTOList = [];
                var result = _.find($scope.traceEdit.detailsGrid.kendoGrid.dataSource.data(), function (item) {
                    if (inStationCode === '' || inStationCode === item.inStationCode) {
                        inStationCode = item.inStationCode;
                        $scope.traceEdit.trace.editWayBillDetailDTOList.push({
                            outStorageBillCode: item.outStorageBillCode,
                            operatorName: item.operatorName,
                            packageType: item.packageType,
                            packageNumbers: _.toArray(item.packageNumbers),
                            totalCount: item.totalCount,
                            totalAmount: item.totalAmount,
                            outStationCode: item.outStationCode,
                            inStationCode: item.inStationCode,
                            outStorageTime: item.outStorageTime
                        });
                        return false;
                    } else {
                        return true;
                    }
                });
                if (result) {
                    swal('存在入库站点不一致的单据');
                } else {
                    saveTrace($scope.traceEdit.trace);
                }
            }
        }

        // 保存trace
        function saveTrace(trace) {
            ApiService.post('/api/bill/waybill/createWayBill', trace).then(function (response) {
                alert(213);
            }, ApiService);
        }

        /**
         * 删除
         */
        $scope.traceEdit.deleteDetails = function () {
            var selectIds = $scope.traceEdit.detailsGrid.kendoGrid.selectedKeyNames();
            var itemPos = _.chain($scope.traceEdit.detailsList).map(function (item, index) {
                if (_.indexOf(selectIds, item.outStorageBillCode) > -1) {
                    return index;
                }
            }).reverse().value();
            _.each(itemPos, function (index) {
                if (_.isNumber(index)) {
                    $scope.traceEdit.detailsList.splice(index, 1)
                }
            });
            $scope.traceEdit.detailsGrid.kendoGrid.dataSource.data($scope.traceEdit.detailsList);
        }

        // 打开modal
        $scope.traceEdit.traceEditModal = $uibModal.open({
            templateUrl: 'app/bill/trace/modals/traceEdit.html',
            scope: $scope,
            size: 'lg'
        });
    }
});