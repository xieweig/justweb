'use strict';

angular.module('app').controller('PlanAuditCtrl', function ($scope, ApiService, params, Common, $timeout) {
    $scope.type = params.type;

    ApiService.get('/api/bill/plan/hq/findByBillCode?billCode=' + params.billCode).then(function (response) {
        if (response.code !== '000') {
            swal('', response.message, 'error');
        } else {
            $scope.plan = response.result.bill;
            $scope.plan.planMemo = $scope.plan.planMemo || $scope.plan.memo;
            $scope.plan.billTypeName = getTextByVal($scope.billType, $scope.plan.billType);
            var isCargo = $scope.plan.basicEnum === 'BY_CARGO';
            var goodsCodes = _.map($scope.plan.planBillDetails, function (item) {
                return item.goodsCode;
            });
            // 判断是否需要获取供应商名称
            getSupplierName($scope.plan.planBillDetails, function () {
                // 根据code查找货物/原料
                if (isCargo) {
                    Common.getCargoByCodes(goodsCodes).then(function (cargoList) {
                        var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                            return item.cargoCode
                        }), cargoList);
                        _.each($scope.plan.planBillDetails, function (item) {
                            item.cargo = cargoObject[item.goodsCode];
                        });
                        getPanel(isCargo);
                    });
                } else {
                    Common.getMaterialByCodes(goodsCodes).then(function (materialList) {
                        var materialObject = _.zipObject(_.map(materialList, function (item) {
                            return item.materialCode
                        }), materialList);
                        _.each($scope.plan.planBillDetails, function (item) {
                            item.material = materialObject[item.goodsCode];
                        });
                        getPanel(isCargo);
                    });
                }
            });
        }
    });

    // 获取供应商名称
    function getSupplierName(data, cb) {
        if ($scope.plan.billType === 'RETURNED') {
            var supplierCodes = [];
            _.each(data, function (dataItem) {
                supplierCodes = supplierCodes.concat(_.map(dataItem.resultPlanBillDetailDTOSet, function (item) {
                    return item.inLocation.stationCode;
                }));
            });
            // 回显供应商
            Common.getSupplierByIds(supplierCodes).then(function (supplierList) {
                var supplierObj = _.zipObject(_.map(supplierList, function (item) {
                    return item.supplierCode;
                }), supplierList);
                _.each(data, function (dataItem) {
                    _.each(dataItem.resultPlanBillDetailDTOSet, function (item) {
                        var supplier = supplierObj[item.inLocation.stationCode];
                        if (supplier) {
                            if (!item.inLocation) {
                                item.inLocation = {};
                            }
                            item.inLocation.stationName = supplier.supplierName;
                        }
                    });
                });
                cb();
            });
        } else {
            _.each(data, function (dataItem, index) {
                _.each(dataItem.resultPlanBillDetailDTOSet, function (item) {
                    item.inStationName = getTextByVal($scope.station, item.inLocation.stationCode);
                });
            });
            cb();
        }
    }

    // 获取展示面包
    function getPanel(isCargo) {
        _.each($scope.plan.planBillDetails, function (item) {
            pushItem(isCargo, item);
        });
    }

    // 添加原料
    $scope.itemMap = [];
    function pushItem(isCargo, item) {
        var result = {
            unfurled: false,
            stationGrid: {
                kendoSetting: {
                    dataSource: item.resultPlanBillDetailDTOSet,
                    columns: [
                        {
                            title: "调出站点",
                            template: function (data) {
                                return getTextByVal($scope.station, data.outLocation.stationCode)
                            }
                        },
                        {
                            title: "调入站点",
                            template: function (data) {
                                // if (data.inLocation.stationType === 'SUPPLIER') {
                                if (data.inLocation.stationName) {
                                    return data.inLocation.stationName;
                                }
                                return getTextByVal($scope.station, data.inLocation.stationCode);
                            }
                        },
                        {field: "amount", title: "调剂数量"}
                    ]
                }
            }
        };
        if (isCargo) {
            result.cargo = item.cargo;
        } else {
            result.material = item.material;
        }
        $scope.itemMap.push(result);
    }

    // 伸缩项
    $scope.scaling = function (index) {
        $scope.itemMap[index].unfurled = !$scope.itemMap[index].unfurled;
    };

    $scope.auditBill = function (pass) {
        var url = '';
        if (pass) {
            url = '/api/bill/plan/auditSuccess';
        } else {
            url = '/api/bill/plan/auditFailure';
        }
        var outStationCodes = [];
        _.each($scope.plan.planBillDetails, function (materialItem) {
            _.each(materialItem.resultPlanBillDetailDTOSet, function (stationItem) {
                outStationCodes.push(stationItem.outLocation.stationCode);
            });
        });
        var auditParams = {
            billCode: params.billCode,
            auditMemo: $scope.plan.auditMemo,
            outStationCodes: _.union(outStationCodes)
        };
        ApiService.post(url, auditParams).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功', '', 'success').then(function () {
                    $scope.$close();
                });
            }
        }, apiServiceError);
    };
});