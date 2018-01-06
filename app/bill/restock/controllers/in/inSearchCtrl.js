'use strict';

angular.module('app').controller('inSearchCtrl', function ($scope, $state, $uibModal) {
    $scope.params = {};
    $scope.tmp = 0;

    $scope.billAttr = [
        {value: '', text: '配送计划转'},
        {value: '', text: '调剂计划转'},
        {value: '', text: '退货计划转'},
        {value: '', text: '无计划计划转'}
    ];

    $scope.inStationBill = {
        primaryId: 'code',
        kendoSetting: {
            // height: 500,
            autoBind: false,
            persistSelection: true,
            editable: true,
            pageable: true,
            columns: [
                {
                    command: [{name: 'e', text: "调拨", click: transfer}, {name: 's', text: "查看", click: view}],
                    title: "操作", locked: true, width: 110
                },
                {field: "fromBillCode", locked: true, title: "来源单号", width: 150},
                {field: "inBillCode", locked: true, title: "入库单号", width: 150},
                {field: "billStatue", title: "单据状态", width: 100},
                {field: "billType", title: "单据属性", width: 100},
                {field: "recordTime", title: "录单时间", width: 150},
                {field: "inTime", title: "入库时间", width: 150},
                {field: "creatorName", title: "入库人", width: 100},
                {field: "outStation", title: "出库站点", width: 100},
                {field: "inStation", title: "入库站点", width: 100},
                {field: "inNumber", title: "入库数量", width: 100},
                {field: "inVariety", title: "入库品种", width: 100},
                {field: "totalPrice", title: "总进价", width: 100}
            ]
        }
    };

    // 选择站点
    $scope.inStationParams = {
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.outStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 查询
    $scope.search = function () {
        $scope.inStationBill.kendoGrid.dataSource.add({
            "billStatue": "单据状态",
            "billType": "单据属性",
            "fromBillCode": "来源单号",
            "inBillCode": "入库单号",
            "recordTime": "录单时间",
            "inTime": "入库时间",
            "creatorName": "入库人",
            "outStation": "出库站点",
            "inStation": "入库站点",
            "inNumber": "入库数量",
            "inVariety": "入库品种",
            "totalPrice": "总进价"
        })
    }

    // 重置
    $scope.reset = function () {

    }

    // 查看
    function view(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        // $state.go('app.bill.restock.inView', {pickId: dataItem.inBillCode})
        $scope.outModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/outBillModal.html',
            size: 'lg',
            controller: 'outBillModalCtrl',
            resolve: {
                data: {
                    billCode: dataItem.inBillCode,
                    type: 'inview'
                }
            }
        })
    }

    // 调拨
    function transfer(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        // $state.go('app.bill.restock.inAction', {pickId: dataItem.inBillCode})
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/transferView.html',
            size: 'lg',
            controller: 'TransferViewModalCtrl',
            resolve: {
                data: {
                    number: dataItem.outCode,
                    type: 'transfer'
                }
            }
        })
    }

});