'use strict';

angular.module('app').controller('AdjustListCtrl', function ($scope, $state, $uibModal, ApiService, Common, cargoUnit, materialUnit) {
    $scope.params = {};
    // 搜索条件中的出库站点选择
    $scope.params.outStationCodes = [$.cookie('currentStationCode')];
    $scope.outStationParams = {
        initTip: decodeURIComponent($.cookie('currentStationName')),
        callback: function (data) {
            $scope.params.outStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索条件中的入库站点选择
    $scope.inStationParams = {
        callback: function (data) {
            $scope.params.inStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 重置页面
    $scope.resetPage = function () {
        $state.reload($state.current.name);
    };

    // 搜索
    $scope.search = function () {
        $scope.planGrid.kendoGrid.dataSource.page(1);
    };

    $scope.planGrid = {
        url: '/api/bill/adjust/findPlanByConditions',
        params: $scope.params,
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {
                    title: "操作", width: 80,
                    command: [
                        {
                            name: 'picking', text: "拣货", click: picking,
                            visible: function (data) {
                                return !data.operationState || data.operationState === 'NOOPERATION';
                            }
                        },
                        {
                            name: 'look', text: "查看", click: lookDetails,
                            visible: function (data) {
                                return data.operationState && data.operationState !== 'NOOPERATION';
                            }
                        }
                    ]
                },
                {field: "billCode", title: "站点计划号", width: 120, template: '<a href="javascript:void(0);" class="billCode">#: data.billCode #</a>'},
                {field: "createTime", title: "录单时间", width: 120},
                {field: "operatorName", title: "录单人", width: 120},
                {
                    title: "出库站点", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.station, data.outStationCode);
                    }
                },
                {
                    title: "调入站点", width: 120,
                    template: function (data) {
                        return getTextByVal($scope.station, data.inStationCode);
                    }
                },
                {field: "totalAmount", title: "数量", width: 120},
                {field: "typeAmount", title: "规格品种", width: 120},
                {field: "planMemo", title: "备注", width: 120}
            ]
        }
    };

    // 点击计划单号
    $('#planGrid').on('click', 'a.billCode', function (e) {
        var dataItem = $scope.planGrid.kendoGrid.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/billDetails.html',
            size: 'lg',
            scope: $scope,
            controller: 'AdjustPlanDetailsCtrl',
            resolve: {
                params: {
                    billCode: dataItem.billCode,
                    cargoUnit: cargoUnit
                }
            }
        });
    });

    // 拣货
    function picking(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        getDetails(dataItem.billCode, function (bill) {
            $uibModal.open({
                templateUrl: 'app/bill/adjust/modals/planPick.html',
                controller: 'AdjustPlanPickCtrl',
                size: 'lg',
                resolve: {
                    params: {
                        bill: bill,
                        cargoUnit: cargoUnit,
                        materialUnit: materialUnit
                    }
                }
            }).closed.then(function () {
                $scope.planGrid.kendoGrid.dataSource.read();
            });
        });
    }

    // 查看详情
    function lookDetails(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/details.html',
            size: 'lg',
            scope: $scope,
            controller: 'AdjustDetailsCtrl',
            resolve: {
                params: {
                    type: 'planLook',
                    billCode: dataItem.billCode
                }
            }
        });
    }

    function getDetails(billCode, cb) {
        if (!billCode) {
            return '';
        }
        ApiService.get('/api/bill/adjust/findPlanByBillCode?billCode=' + billCode).then(function (response) {
            if (response.code !== '000') {
                swal('请求失败', response.message, 'error');
            } else {
                var bill = response.result.bill;
                bill.inStationName = getTextByVal($scope.station, bill.inStationCode);
                bill.outStationName = getTextByVal($scope.station, bill.outStationCode);

                // 回显原料名称
                var materialCodes = _.map(bill.childPlanBillDetails, function (item) {
                    return item.rawMaterial.rawMaterialCode;
                });
                Common.getMaterialByCodes(materialCodes).then(function (materialList) {
                    var materialObject = _.zipObject(_.map(materialList, function (item) {
                        return item.materialCode
                    }), materialList);

                    _.each(bill.childPlanBillDetails, function (item) {
                        var material = materialObject[item.rawMaterial.rawMaterialCode] || {};
                        item.rawMaterial.rawMaterialName = material.materialName;
                    });
                    cb(bill);
                });

            }
        }, apiServiceError);
    }
});
