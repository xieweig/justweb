'use strict';

angular.module('app').controller('PlanSearchCtrl', function ($scope, $rootScope, $state, $uibModal, ApiService) {
    // 查询站点退库计划
    $scope.params = {};

    // 搜索
    $scope.search = function () {
        $scope.stationGrid.kendoGrid.dataSource.page(1);
    };

    // 初始化计划列表
    $scope.stationGrid = {
        primaryId: 'billCode',
        url: '/api/bill/restock/findPlanBillByConditions',
        params: $scope.params,
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {
                    command: [{
                        name: 'select', text: "拣货", click: jumpToPick, visible: function (data) {
                            return data.operationState === 'NOOPERATION';
                        }
                    }], title: "操作", width: 80
                },
                {
                    title: "完成率", width: 60, template: function (data) {
                        return '<a href="#" class="rate-btn-group">' + data.progress || 0 + '%</a>';
                    }
                },
                {
                    field: "billCode", title: "站点计划号", template: function (data) {
                        return '<a href="#" class="plan-btn-group">' + data.billCode + '</a>';
                    }
                },
                {field: "createTime", title: "录单时间", width: 100},
                {field: "operatorName", title: "录单人", width: 60},
                {
                    field: "outStationCode", title: "出库站点", template: function (data) {
                        return getTextByVal($scope.station, data.outStationCode)
                    }
                },
                {
                    field: "inStationCode", title: "调入站点", template: function (data) {
                        return getTextByVal($scope.station, data.inStationCode)
                    }
                },
                {field: "totalAmount", title: "数量", width: 60},
                {field: "typeAmount", title: "规格品种"},
                {field: "memo", title: "备注"}
            ]
        }
    };

    // 选择站点
    $scope.inStationParams = {
        callback: function (data) {
            var array = _.map(data, function (item) {
                return item.stationCode;
            });
            $scope.params.inStationCodeArray = array.join(',')
        }
    };

    $scope.outStationParams = {
        callback: function (data) {
            var array = _.map(data, function (item) {
                return item.stationCode;
            });
            $scope.params.outStationCodeArray = array.join(',')
        }
    };

    // 拣货跳转
    function jumpToPick(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        console.log(dataItem);
        $state.go('app.bill.restock.stationPick', {pickId: dataItem.billCode})
    }

    // 站点计划号跳转
    var grid = $('#grid');
    grid.on('click', '.plan-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.stationGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/planView.html',
            size: 'lg',
            controller: 'PlanViewModalCtrl',
            resolve: {
                data: {
                    billCode: dataItem.billCode
                }
            }
        })
    });

    // 完成率跳转到出库单 改为弹窗
    grid.on('click', '.rate-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.stationGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        ApiService.get('/api/bill/restock/findRestockBillBySourceCode?sourceCode=' + dataItem.billCode).then(function (response) {
            if (response.code === '000') {
                console.log(response.result);
                var restockCode = response.result.restockBill.billCode
                openModal('view', {billCode: restockCode})
            } else {
                swal('请求失败', response.message, 'error');
            }
        }, apiServiceError);
        // $state.go('app.bill.restock.outView', {planId: dataItem.receiveCode})
    });

    // 重置表格
    $scope.reset = function () {
        $state.params = {}
        $state.reload()
    };

    function openModal(type, data) {
        $scope.outModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/outBillModal.html',
            size: 'lg',
            controller: 'outBillModalCtrl',
            resolve: {
                data: {
                    billCode: data.billCode,
                    type: type
                }
            }
        })
    }
});