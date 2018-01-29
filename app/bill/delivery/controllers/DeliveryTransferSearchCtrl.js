'use strict';

angular.module('app').controller('DeliveryTransferSearchCtrl', function ($scope, $rootScope, $state, $uibModal, ApiService, Common, cargoUnit, materialUnit) {
    // 查询站点退库计划
    $scope.params = {};
    $scope.count = 0;

    $scope.storageType = [
        {value: 'NORMAL', text: '正常库'},
        {value: 'STORAGE', text: '仓储库'},
        {value: 'IN_STORAGE', text: '进货库'},
        {value: 'OUT_STORAGE', text: '退货库'},
        {value: 'ON_STORAGE', text: '在途库'},
        {value: 'RESERVE_STORAGE', text: '预留库'}
    ];

    // 搜索
    $scope.search = function () {
        $scope.stationGrid.kendoGrid.dataSource.page(1);
    };

    // 初始化计划列表
    $scope.stationGrid = {
        primaryId: 'billCode',
        url: '/api/bill/delivery/findAllotByConditions',
        params: $scope.params,
        // dataSource: {
        //     parameterMap: function (data) {
        //         if (!data['inStationCodes'] || (data['inStationCodes']).length === 0) {
        //             data['inStationCodes'] = ['USER_ALL'];
        //         }
        //     }
        // },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            height:300,
            columns: [
                {
                    command: [{
                        name: 'view', text: '查看', click: viewInStorageBill, visible: function () {
                            return true;
                        }
                    }],  locked: true, title: "操作", width: 80
                },
                {field: "createTime", title: "来源单号", width: 250, template: function (data) {
                        return '<a href="#" class="plan-btn-group">' + data.sourceCode + '</a>'
                    }},
                {field: "billCode", title: "调拨单号", width: 250},
                {title: "单据属性", width: 100, template: function (data) {
                        return getTextByVal($scope.sourceBillType, data.sourceBillType) + '转'
                    }},
                {field: "createTime", title: "调拨时间", width: 100},
                {field: "operatorName", title: "操作人", width: 60},
                {
                    title: "入库单出库站点", width: 150, template: function (data) {
                        return getTextByVal($scope.station, data.inStorageBillOutStationCode)
                    }
                },
                {
                    title: "入库单入库站点", width: 150, template: function (item) {
                        return getTextByVal($scope.station, item.inStorageBillInStationCode)
                    }
                },
                {field: "outStorageName", title: "调拨单调出库位", width: 100, template: function (data) {
                        return getTextByVal($scope.storageType, data.outLocation.storage.storageCode)
                    }},
                {field: "inStorageName", title: "调拨单调入库位", width: 100, template: function (data) {
                        return getTextByVal($scope.storageType, data.inLocation.storage.storageCode)
                    }},
                {field: "totalAmount", title: "调拨数量", width: 60},
                {field: "totalVarietyAmount", title: "调拨品种", width: 60},
                // {field: "totalPrice", title: "总进价", width: 60}
            ]
        }
    };

    // 选择站点
    $scope.inStationParams = {
        type: 'BOOKSTORE,CAFE,WHOLESALE,STAPLE',
        callback: function (data) {
            $scope.params.inStorageBillInStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    $scope.outStationParams = {
        type: 'LOGISTICS',
        callback: function (data) {
            $scope.params.inStorageBillOutStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 拣货跳转
    function jumpToPick(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        console.log(dataItem);
        $state.go('app.bill.delivery.stationPick', {pickId: dataItem.billCode})
    }

    function viewInStorageBill(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.transferModal = $uibModal.open({
            templateUrl: 'app/bill/delivery/modals/transferModal.html',
            size: 'lg',
            controller: 'DeliveryTransferModalCtrl',
            resolve: {
                data: {
                    billCode: dataItem.billCode,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit,
                    type: 'view'
                }
            }
        });
        $scope.transferModal.closed.then(function () {
            $scope.stationGrid.kendoGrid.dataSource.read();
        });
    }

    // 站点计划号跳转
    var grid = $('#grid');
    grid.on('click', '.plan-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.stationGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $scope.inModal = $uibModal.open({
            templateUrl: 'app/bill/delivery/modals/inStorageModal.html',
            size: 'lg',
            controller: 'DeliveryInStorageModalCtrl',
            resolve: {
                data: {
                    billCode: dataItem.sourceCode,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit
                }
            }
        })
    });

    // 重置表格
    $scope.reset = function () {
        // $state.params = {};
        $state.reload($state.current.name)
    };

    function openModal(type, data) {
        $scope.outModal = $uibModal.open({
            templateUrl: 'app/bill/delivery/modals/outBillModal.html',
            size: 'lg',
            controller: 'outBillModalCtrl',
            resolve: {
                data: {
                    billCode: data.billCode,
                    type: type,
                    cargoUnit: cargoUnit
                }
            }
        })
    }
});