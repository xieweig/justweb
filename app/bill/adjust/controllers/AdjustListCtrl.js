'use strict';

angular.module('app').controller('AdjustListCtrl', function ($scope, $uibModal, ApiService, Common, cargoUnit, materialUnit) {
    $scope.params = {};
    // 搜索条件中的出库站点选择
    $scope.outStationParams = {
        callback: function (data) {
            $scope.params.inStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索条件中的入库站点选择
    $scope.inStationParams = {
        callback: function (data) {
            $scope.params.outStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
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
                            visible: function (item) {
                                return item.submitState === 'UNCOMMITTED';
                            }
                        },
                        {
                            name: 'look', text: "查看", click: lookDetails,
                            visible: function (item) {
                                return item.submitState !== 'UNCOMMITTED';
                            }
                        }
                    ]
                },
                {field: "billCode", title: "站点计划号", width: 120},
                {field: "createTime", title: "录单时间", width: 120},
                {field: "operatorName", title: "录单人", width: 120},
                {field: "outStationCode", title: "出库站点", width: 120},
                {field: "inStationCode", title: "调入站点", width: 120},
                {field: "totalAmount", title: "数量", width: 120},
                {field: "typeAmount", title: "规格品种", width: 120},
                {field: "planMemo", title: "备注", width: 120}
            ]
        }
    };

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
                    type: 'look',
                    billCode: '123123'
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
