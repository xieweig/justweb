'use strict';

angular.module('app').controller('DeliveryPlanSearchCtrl', function ($scope, $rootScope, $state, $uibModal, ApiService, cargoUnit, materialUnit) {
    $scope.params = {};

    // 搜索
    $scope.search = function () {
        $scope.planGrid.kendoGrid.dataSource.page(1);
    };

    // 初始化计划列表
    $scope.planGrid = {
        primaryId: 'billCode',
        url: '/api/bill/delivery/findPlanByConditions',
        params: $scope.params,
        dataSource: {
            parameterMap: function (data) {
                if (!data['outStationCodes'] || (data['outStationCodes']).length === 0) {
                    data['outStationCodes'] = ['USER_ALL'];
                }
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {
                    command: [{
                        name: 'select', text: "拣货", click: jumpToPick, visible: function (data) {
                            return !data.operationState || data.operationState === 'NOOPERATION';
                        }
                    }, {
                        name: 'view', text: '查看', click: viewOutStorageBill, visible: function (data) {
                            return data.operationState  && data.operationState !== 'NOOPERATION';
                        }
                    }], title: "操作", width: 80
                },
                {
                    field: "billCode", title: "站点计划号", width:250, template: function (data) {
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

    // 搜索条件中的入库站点选择
    $scope.inStationParams = {
        type: 'BOOKSTORE,CAFE,WHOLESALE,STAPLE',
        callback: function (data) {
            $scope.params.inStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索条件中的出库站点选择
    $scope.outStationParams = {
        type: 'LOGISTICS',
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
            templateUrl: 'app/bill/delivery/modals/pickByPlanModal.html',
            size: 'lg',
            controller: 'DeliveryPickByPlanModalCtrl',
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
        ApiService.get('/api/bill/delivery/findBySourceCode?sourceCode=' + dataItem.billCode).then(function (response) {
            if (response.code === '000') {
                console.log(response.result);
                var deliveryCode = response.result.bill.billCode;
                openModal('view', {billCode: deliveryCode})
            } else {
                swal('请求失败', response.message, 'error');
            }
        }, apiServiceError);
    }

    // 站点计划号跳转
    var grid = $('#grid');
    grid.on('click', '.plan-btn-group', function (e) {
        e.preventDefault();
        var dataItem = $scope.planGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/delivery/modals/planView.html',
            size: 'lg',
            controller: 'DeliveryPlanViewModalCtrl',
            resolve: {
                data: {
                    billCode: dataItem.billCode,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit
                }
            }
        });
        $scope.addModal.closed.then(function () {
            $scope.planGrid.kendoGrid.dataSource.read();
        });
    });

    // 重置表格
    $scope.reset = function () {
        $state.reload($state.current.name)
    };

    function openModal(type, data) {
        $scope.outModal = $uibModal.open({
            templateUrl: 'app/bill/delivery/modals/outStorageModal.html',
            size: 'lg',
            controller: 'DeliveryOutStorageModalCtrl',
            resolve: {
                data: {
                    billCode: data.billCode,
                    type: type,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit
                }
            }
        });
        $scope.outModal.closed.then(function () {
            $scope.planGrid.kendoGrid.dataSource.read();
        });
    }
});