'use strict';

angular.module('app').controller('ReturnedPlanSearchCtrl', function ($scope, $rootScope, $state, $uibModal, ApiService, cargoUnit, materialUnit) {
    $scope.params = {};

    // 搜索
    $scope.search = function () {
        $scope.stationGrid.kendoGrid.dataSource.page(1);
    };

    // 初始化计划列表
    $scope.stationGrid = {
        primaryId: 'billCode',
        url: '/api/bill/returned/findPlanByConditions',
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
                    }, {
                        name: 'view', text: '查看', click: viewOutStorageBill, visible: function (data) {
                            return data.operationState !== 'NOOPERATION';
                        }
                    }], title: "操作", width: 80
                },
                {
                    field: "billCode", title: "站点计划号", template: function (data) {
                        return '<a href="#" class="plan-btn-group">' + data.billCode + '</a>';
                    }
                },
                {field: "createTime", title: "录单时间", width: 100},
                {field: "operatorName", title: "录单人", width: 60},
                {
                    field: "outStationCode", title: "调出站点", template: function (data) {
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
        type: 'supplier',
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

    // 拣货跳转
    function jumpToPick(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/returned/modals/pickByPlanModal.html',
            size: 'lg',
            controller: 'ReturnedPickByPlanModalCtrl',
            resolve: {
                data: {
                    billCode: dataItem.billCode,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit
                }
            }
        })
        // $state.go('app.bill.returned.stationPick', {pickId: dataItem.billCode})
    }

    function viewOutStorageBill(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        ApiService.get('/api/bill/returned/findBySourceCode?sourceCode=' + dataItem.billCode).then(function (response) {
            if (response.code === '000') {
                console.log(response.result);
                var returnedCode = response.result.bill.billCode;
                openModal('view', {billCode: returnedCode})
            } else {
                swal('请求失败', response.message, 'error');
            }
        }, apiServiceError);
    }

    // 站点计划号跳转
    var grid = $('#grid');
    grid.on('click', '.plan-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.stationGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/returned/modals/planView.html',
            size: 'lg',
            controller: 'ReturnedPlanViewModalCtrl',
            resolve: {
                data: {
                    billCode: dataItem.billCode,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit
                }
            }
        })
    });

    // 重置表格
    $scope.reset = function () {
        $state.params = {};
        $state.reload()
    };

    function openModal(type, data) {
        $scope.outModal = $uibModal.open({
            templateUrl: 'app/bill/returned/modals/outStorageBillModal.html',
            size: 'lg',
            controller: 'ReturnedOutStorageModalCtrl',
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