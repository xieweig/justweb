'use strict';

angular.module('app').controller('TraceAddCtrl', function ($scope, $state, $uibModal, $timeout, ApiService, params) {
    $scope.trace = {};
    $scope.isRead = params.isRead;
    initTraceEdit(params.isRead);
    $scope.initPage = function () {
        if (params.bill) {
            // 初始化参数
            $scope.trace = params.bill;
        }
    };

    // 搜索条件中的出库站点选择
    $scope.outStationParams = {
        single: true,
        isSupplier: true,
        initTip: params.bill ? params.bill.outStationName : '',
        callback: function (data) {
            $scope.trace.outStationCode = data.stationCode || data.supplierCode;
            $scope.trace.outStationName = data.stationName || data.supplierName;
        }
    };

    // 搜索条件中的入库站点选择
    $scope.inStationParams = {
        single: true,
        isSupplier: true,
        initTip: params.bill ? params.bill.inStationName : '',
        callback: function (data) {
            $scope.trace.inStationCode = data.stationCode || data.supplierCode;
            $scope.trace.inStationName = data.stationName || data.supplierName;
        }
    };

    /**
     * 初始化
     */
    function initTraceEdit(isRead) {
        $scope.detailsGrid = {
            primaryId: 'outStorageBillCode',
            kendoSetting: {
                editable: true,
                autoBind: false,
                persistSelection: true,
                columns: [
                    {field: "outStorageBillCode", title: "出库单号", width: 120},
                    {title: "所属包号", width: 120, template: '#: data.packageNumbers #'},
                    {field: "outStationName", title: "出库站点", width: 120},
                    {field: "inStationName", title: "入库站点", width: 120},
                    {field: "outStorageTime", title: "出库时间", width: 150},
                    {field: "operatorName", title: "录单人", width: 120},
                    {field: "totalCount", title: "品种数", width: 120},
                    {field: "totalAmount", title: "货物数", width: 120}
                ]
            },
            ready: function () {
                if ($scope.trace.editWayBillDetailDTOList) {
                    $scope.detailsGrid.kendoGrid.dataSource.data($scope.trace.editWayBillDetailDTOList);
                }
            }
        };
        if (!isRead) {
            $scope.detailsGrid.kendoSetting.columns.splice(0, 0, {selectable: true});
        }
    }

    /**
     * 打开增加货单明细modal
     */
    $scope.showAddModal = function () {
        $scope.currentDetails = {};
        $scope.packageMap = [{text: ''}];
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/trace/modals/traceDetails.html',
            scope: $scope,
            size: 'lg'
        });
    };


    /**
     * 编辑货物中的包选择
     */
    $scope.packageMap = [{text: ''}];
    $scope.packageTypeChange = function () {
        $scope.packageMap = [{text: ''}];
    };

    $scope.addPackageMap = function () {
        $scope.packageMap.push({text: ''});
    };

    /**
     * 增加一条明细
     * @param {*是否点击的下一条 如果点击的下一条需要清空表格数据} isNext
     */
    $scope.addDetails = function (isNext) {
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
            $scope.currentDetails.packageNumbers = packageNumbers.join();
        }

        if (!$scope.currentDetails) {
            swal('请输入填写单据详情', '', 'warning');
        } else if (!$scope.currentDetails.outStorageBillCode) {
            swal('请输入出库单号', '', 'warning');
        } else if (!$scope.currentDetails.operatorName) {
            swal('请输入录单人', '', 'warning');
        } else if (!$scope.currentDetails.packageType) {
            swal('请选择是否单独打包', '', 'warning');
        } else if (!packageNumbersPass) {
            swal('请填写所属包号', '', 'warning');
        } else if (!$scope.currentDetails.totalCount) {
            swal('请输入品种数', '', 'warning');
        } else if (!$scope.currentDetails.totalAmount) {
            swal('请输入货物数', '', 'warning');
        } else if (!$scope.currentDetails.outStorageTime) {
            swal('请输入出库时间', '', 'warning');
        } else {
            var dataSource = $scope.detailsGrid.kendoGrid.dataSource;
            var repeatIndex = _.findIndex(dataSource.data(), function (item) {
                return item.outStorageBillCode === $scope.currentDetails.outStorageBillCode;
            });
            if (repeatIndex >= 0) {
                swal('该出库单号已存在', '', 'warning');
                return true;
            }
            dataSource.add($scope.currentDetails);
            $scope.currentDetails = {};
            $scope.packageMap = [{text: ''}];
            $timeout(function () {
                $('#packageType').val('').trigger('change');
            });
            if (!isNext) {
                $scope.addModal.close();
            }
        }
    };


    /**
     * 保存运单
     */
    $scope.save = function () {
        if (!$scope.trace) {
            swal('请输入填写单据详情', '', 'warning');
        } else if (!$scope.trace.deliveryTime) {
            swal('请输入发货时间', '', 'warning');
        } else if (!$scope.trace.planArrivalTime) {
            swal('请输入预计到货时间', '', 'warning');
        } else if (!$scope.trace.logisticsCompanyName) {
            swal('请输入物流公司', '', 'warning');
        } else if (!$scope.trace.outStationCode) {
            swal('请输入出库站点', '', 'warning');
        } else if (!$scope.trace.inStationCode) {
            swal('请输入入库站点', '', 'warning');
        } else if ($scope.trace.inStationCode === $scope.trace.outStationCode) {
            swal('出入库站点不能一致', '', 'warning');
        } else if (!$scope.trace.amountOfPackages) {
            swal('请输入运送件数', '', 'warning');
        } else {
            // 获取运单明细
            $scope.trace.editWayBillDetailDTOList = [];
            var repeatMessage = '';
            // 循环表格获取出入库单据
            _.find($scope.detailsGrid.kendoGrid.dataSource.data(), function (item) {
                if (item.outStationCode && $scope.trace.outStationCode !== item.outStationCode) {
                    repeatMessage = '存在出库站点不一致的单据';
                    return true;
                } else if (item.inStationCode && $scope.trace.inStationCode !== item.inStationCode) {
                    repeatMessage = '存在入库站点不一致的单据';
                    return true;
                }
                $scope.trace.editWayBillDetailDTOList.push({
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
                saveTrace($scope.trace);
            }
        }
    };

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
                    if (params.type === 'edit') {
                        $scope.$close();
                    } else {
                        $state.go('app.bill.trace.list');
                    }
                });
            }
        }, apiServiceError);
    }

    /**
     * 删除
     */
    $scope.deleteDetails = function () {
        var selectIds = $scope.detailsGrid.kendoGrid.selectedKeyNames();
        var dataSource = $scope.detailsGrid.kendoGrid.dataSource;
        var delCount = 0;
        _.chain(dataSource.data()).toArray().reverse().each(function (item) {
            if (_.indexOf(selectIds, item.outStorageBillCode) > -1) {
                delCount++;
                dataSource.remove(item);
            }
        }).value();
        if (delCount === 0) {
            swal('请选择要删除的明细信息', '', 'warning');
        }
    };

    $scope.enterBillCode = function () {
        if (event.keyCode === 13) {
            $scope.searchBill();
        }
    };

    // 查询出库单
    $scope.searchBill = function () {
        if (!$scope.currentDetails.outStorageBillCode) {
            swal('请输入出库单号', '', 'warning');
            return
        }
        ApiService.get('/api/bill/waybill/scanQueryBill?billCode=' + $scope.currentDetails.outStorageBillCode).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                var scanFillBillDTO = response.result.scanFillBillDTO;
                if (!scanFillBillDTO) {
                    $scope.currentDetails = {};
                } else {
                    $scope.currentDetails = {
                        isRead: true,
                        outStorageBillCode: scanFillBillDTO.billCode,
                        totalAmount: scanFillBillDTO.totalAmount,
                        totalCount: scanFillBillDTO.totalCount,
                        outStorageTime: scanFillBillDTO.outStockTime,
                        inStationCode: scanFillBillDTO.inStationCode,
                        inStationName: getTextByVal($scope.station, scanFillBillDTO.inStationCode),
                        outStationCode: scanFillBillDTO.outStationCode,
                        outStationName: getTextByVal($scope.station, scanFillBillDTO.outStationCode),
                        operatorName: scanFillBillDTO.operatorName
                    };
                    $timeout(function () {
                        $('#packageType').val('ONE_BILL_TO_MANY_PACKAGE').trigger('change');
                        $scope.packageMap = _.map(scanFillBillDTO.packNumbers, function (item) {
                            return {text: item};
                        });
                    });
                }
            }
        }, apiServiceError);
    }
});