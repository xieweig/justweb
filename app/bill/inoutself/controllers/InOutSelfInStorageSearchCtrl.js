'use strict';

angular.module('app').controller('InOutSelfInStorageSearchCtrl', function ($scope, $rootScope, $state, $uibModal, ApiService, cargoUnit, materialUnit) {
    // 查询站点退库计划
    $scope.params = {
        specificBillType: []
    };

    $scope.billStatus = [
        {value: 'ALLOT', text: '已调拨'},
        {value: 'NOT_ALLOT', text: '未调拨'}
    ];

    $scope.billState = [
        {value: 'SAVED', text: '已保存'},
        {value: 'SUBMITTED', text: '已提交'},
        {value: 'OPEN', text: '审核中'},
        {value: 'AUDIT_FAILURE', text: '审核失败'},
        {value: 'AUDIT_SUCCESS', text: '审核成功'},
        {value: 'OUT_STORAGING', text: '出库中'},
        {value: 'IN_STORAGING', text: '入库中'},
        {value: 'DONE', text: '完成'}
    ];

    // 搜索
    $scope.search = function () {
        $scope.stationGrid.kendoGrid.dataSource.page(1);
    };

    // 初始化计划列表
    $scope.stationGrid = {
        primaryId: 'billCode',
        url: '/api/bill/inOutSelf/findInStorageByConditions',
        params: $scope.params,
        dataSource: {
            parameterMap: function (data) {
                if (!data['inStationCodes'] || (data['inStationCodes']).length === 0) {
                    data['inStationCodes'] = ['USER_ALL'];
                }
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            persistSelection: true,
            height: 300,
            columns: [
                {
                    command: [
                        {
                            name: 'view', text: '查看', click: viewInStorageBill, visible: function (data) {
                                return true;
                            }
                        }, {
                            name: 'select', text: "调拨", click: jumpToPick, visible: function (data) {
                                return data.allotStatus === 'NOT_ALLOT';
                            }
                        }
                    ],
                    locked: true,
                    title: "操作",
                    width: 160
                },
                {
                    field: "createTime", title: "来源单号", width: 250, template: function (data) {
                        return '<a href="#" class="plan-btn-group">' + data.sourceCode || '' + '</a>'
                    }
                },
                {field: "billCode", title: "入库单号", width: 250},
                {
                    title: "单据状态", width: 100, template: function (data) {
                        return getTextByVal($scope.billStatus, data.allotStatus)
                    }
                },
                {
                    title: "单据属性", width: 100, template: function (data) {
                        return getTextByVal($scope.sourceBillType, data.sourceBillType) + '转'
                    }
                },
                {field: "createTime", title: "录单时间", width: 150},
                {field: "inWareHouseTime", title: "入库时间", width: 150},
                {field: "operatorName", title: "入库人", width: 100},
                {
                    field: "outStationCode", title: "出库站点", width: 150, template: function (data) {
                        return getTextByVal($scope.station, data.outLocation.stationCode)
                    }
                },
                {
                    field: "inStationCode", title: "入库站点", width: 150, template: function (data) {
                        return getTextByVal($scope.station, data.inLocation.stationCode)
                    }
                },
                {field: "totalAmount", title: "入库数量", width: 100},
                {field: "totalVarietyAmount", title: "入库品种", width: 100},
                // {field: "totalPrice", title: "总进价", width: 100}
            ]
        }
    };

    // 选择站点
    $scope.inStationParams = {
        callback: function (data) {
            $scope.params.inStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.outStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 调拨跳转
    function jumpToPick(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.transferModal = $uibModal.open({
            templateUrl: 'app/bill/inoutself/modals/transferModal.html',
            size: 'lg',
            controller: 'InOutSelfTransferModalCtrl',
            resolve: {
                data: {
                    billCode: dataItem.billCode,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit,
                    type: 'transfer'
                }
            }
        });
        $scope.transferModal.closed.then(function () {
            $scope.stationGrid.kendoGrid.dataSource.read()
        });
    }

    function viewInStorageBill(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.inModal = $uibModal.open({
            templateUrl: 'app/bill/inoutself/modals/inStorageModal.html',
            size: 'lg',
            controller: 'InOutSelfInStorageModalCtrl',
            resolve: {
                data: {
                    billCode: dataItem.billCode,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit
                }
            }
        })
    }

    // // 来源单号跳转
    // var grid = $('#grid');
    // grid.on('click', '.plan-btn-group', function (e) {
    //     e.preventDefault();
    //     var dataItem = $scope.stationGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
    //     $scope.addModal = $uibModal.open({
    //         templateUrl: 'app/bill/restock/modals/outBillModal.html',
    //         size: 'lg',
    //         controller: 'outBillModalCtrl',
    //         resolve: {
    //             data: {
    //                 type: 'view',
    //                 billCode: dataItem.sourceCode,
    //                 cargoUnit: cargoUnit,
    //                 materialUnit: materialUnit
    //             }
    //         }
    //     })
    // });

    // 重置表格
    $scope.reset = function () {
        $state.reload($state.current.name)
    };

    $scope.$watch('params.billAllotState', function (newVal) {
        if (newVal === '' || newVal === undefined) {
            $scope.params.billAllotState = null;
        }
    });
});