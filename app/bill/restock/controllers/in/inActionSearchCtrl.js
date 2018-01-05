'use strict';

angular.module('app').controller('inActionSearchCtrl', function ($scope, $uibModal) {
    $scope.params = {};
    $scope.tmp = 0;

    $scope.transferBill = {
        primaryId: 'code',
        kendoSetting: {
            autoBind: false,
            persistSelection: true,
            editable: true,
            pageable: true,
            columns: [
                {
                    command: [{name: 's', text: "查看", click: view}],
                    title: "操作",
                    width: 153
                },
                {field: "fromCode", title: "来源单号", width: 150, template: function (data) {
                        return '<a href="#" class="transfer-btn-group">' + data.fromCode + '</a>'
                    }},
                {field: "outCode", title: "出库单号", width: 100},
                {field: "billType", title: "单据属性", width: 80},
                {field: "outStatus", title: "出库状态", width: 70},
                {field: "inputStatus", title: "提交状态", width: 70},
                {field: "checkStatus", title: "审核状态", width: 80},
                {field: "recordTime", title: "录单时间"},
                {field: "outTime", title: "出库时间"}
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

    $scope.addData = function () {
        var dataSource = $scope.transferBill.kendoGrid.dataSource;
        dataSource.add({
            code: $scope.tmp,
            billType: '退库计划转',
            outStatus: '出库成功',
            inputStatus: '已提交',
            checkStatus: '审核不通过',
            fromCode: 'htk001_stk001',
            outCode: 'tkckd005',
            recordTime: '2017-04-15',
            outTime: '2017-04-27'
        })
        $scope.tmp++;
    }

    // 查看
    function view() {

    }

    // 来源单号
    $('#grid').on('click', '.transfer-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.transferBill.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        // $state.go('app.bill.restock.inView', {fromId: dataItem.fromCode})
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/transferView.html',
            size: 'lg',
            controller: 'TransferViewModalCtrl',
            resolve: {
                data: {
                    number: dataItem.fromCode
                }
            }
        })
    });

});