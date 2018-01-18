'use strict';

angular.module('app').controller('PlanAuditCtrl', function ($scope, ApiService, params, Common) {
    $scope.type = params.type;

    ApiService.get('/api/bill/planBill/hq/findByBillCode?billCode=' + params.billCode).then(function (response) {
        if (response.code !== '000') {
            swal('', response.message, 'error');
        } else {
            $scope.plan = response.result.planBill;
            $scope.plan.billTypeName = getTextByVal($scope.billType, $scope.plan.billType);
            var isCargo = $scope.plan.basicEnum === 'BY_CARGO';
            var goodsCodes = _.map($scope.plan.planBillDetails, function (item) {
                return item.goodsCode;
            });
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
        }
    });

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
                            template: function (data) {
                                return getTextByVal($scope.station, data.outLocation.stationCode)
                            }, title: "调出站点"
                        },
                        {
                            template: function (data) {
                                return getTextByVal($scope.station, data.inLocation.stationCode)
                            }, title: "调入站点"
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
            url = '/api/bill/planBill/pass';
        } else {
            url = '/api/bill/planBill/unpass';
        }
        var auditParams = {
            billCode: params.billCode,
            auditMemo: $scope.auditMemo
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