'use strict';

angular.module('app').controller('PlanAddCtrl', function ($scope, $timeout, $state, $uibModal, ApiService, $stateParams, Common, cargoUnit, materialUnit) {
    if ($stateParams.billCode) {
        ApiService.get('/api/bill/planBill/hq/findByBillCode?billCode=' + $stateParams.billCode).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                var planBill = response.result.planBill;
                $scope.plan = {
                    billName: planBill.billName,
                    billCode: planBill.billCode,
                    memo: planBill.memo
                };
                var goodsCode = _.map(planBill.planBillDetails, function (billItem) {
                    return billItem.goodsCode;
                });
                var isCargo = planBill.basicEnum === 'BY_CARGO';
                if (isCargo) {
                    Common.getCargoByCodes(goodsCode).then(function (cargoList) {
                        $('#tabs-1').addClass('active');
                        $('a[href="#tabs-1"]').parent().addClass('active');
                        var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                            return item.cargoCode
                        }), cargoList);
                        _.each(planBill.planBillDetails, function (item) {
                            item.cargo = cargoObject[item.goodsCode];
                        });

                        $scope.cargoMap = _.map(planBill.planBillDetails, function (item) {
                            return pushCargo(item, !isCargo);
                        });

                        $timeout(function () {
                            $('#billType').val(planBill.billType).trigger('change');
                        });
                    });
                } else {
                    Common.getMaterialByCodes(goodsCode).then(function (materialList) {
                        $('#tabs-2').addClass('active');
                        $('a[href="#tabs-2"]').parent().addClass('active');
                        var materialObject = _.zipObject(_.map(materialList, function (item) {
                            return item.materialCode
                        }), materialList);
                        _.each(planBill.planBillDetails, function (item) {
                            item.material = materialObject[item.goodsCode];
                        });

                        $scope.materialMap = _.map(planBill.planBillDetails, function (item) {
                            return pushCargo(item, !isCargo);
                        });

                        $timeout(function () {
                            $('#billType').val(planBill.billType).trigger('change');
                        });
                    });
                }
            }
        }, apiServiceError);
    } else {
        $scope.plan = {};
        $('#tabs-1').addClass('active');
        $('a[href="#tabs-1"]').parent().addClass('active');
    }

    $timeout(function () {
        $('.nav-tabs a').click(function () {
            var $this = $(this);
            swal({
                title: '该操作将会清空原有的数据,确定继续?',
                showCancelButton: true,
                type: "warning"
            }).then(function (result) {
                var tabType = $this.attr('tabType'), showBlock = '';
                if (!result.value) {
                    showBlock = tabType;
                    if (tabType === 'cargo') {
                        showBlock = 'material';
                    } else if (tabType === 'material') {
                        showBlock = 'cargo';
                    }
                } else {
                    if (tabType === 'cargo') {
                        $scope.materialMap = [];
                    } else if (tabType === 'material') {
                        $scope.cargoMap = [];
                    }
                    showBlock = tabType;
                }
                if (showBlock === 'cargo') {
                    $('#tabs-1').addClass('active');
                    $('a[href="#tabs-1"]').parent().addClass('active');
                    $('#tabs-2').removeClass('active');
                    $('a[href="#tabs-2"]').parent().removeClass('active');
                } else {
                    $('#tabs-2').addClass('active');
                    $('a[href="#tabs-2"]').parent().addClass('active');
                    $('#tabs-1').removeClass('active');
                    $('a[href="#tabs-1"]').parent().removeClass('active');
                }
            });
        });
    });


    // 项目数组
    $scope.cargoMap = [];
    $scope.materialMap = [];
    $scope.addItem = function (type) {
        if (type === 'material') {
            $scope.materialMap.splice(0, 0, pushCargo());
        } else {
            $scope.cargoMap.splice(0, 0, pushCargo());
        }
    };

    function pushCargo(item, isMaterial) {
        if (!item) {
            item = {
                resultPlanBillDetailDTOSet: []
            };
        }
        if (isMaterial) {
            return {
                unfurled: true,
                material: item && item.material ? item.material : {},
                stationGrid: {
                    kendoSetting: {
                        height: 200,
                        editable: true,
                        dataSource: item.resultPlanBillDetailDTOSet,
                        columns: [
                            {command: [{name: 'destroy', text: "删除"}], title: "操作", width: 85},
                            {
                                title: "调出站点",
                                template: function (data) {
                                    return getTextByVal($scope.station, data.outLocation.stationCode)
                                }
                            },
                            {
                                title: "调入站点",
                                template: function (data) {
                                    return getTextByVal($scope.station, data.inLocation.stationCode)
                                }
                            },
                            {field: "amount", title: "调剂数量(点击修改)", editable: true}
                        ]
                    }
                }
            };
        } else {
            return {
                unfurled: true,
                cargo: item && item.cargo ? item.cargo : {},
                stationGrid: {
                    kendoSetting: {
                        height: 200,
                        editable: true,
                        dataSource: item.resultPlanBillDetailDTOSet,
                        columns: [
                            {command: [{name: 'destroy', text: "删除"}], title: "操作", width: 85},
                            {
                                title: "调出站点",
                                template: function (data) {
                                    return getTextByVal($scope.station, data.outLocation.stationCode)
                                }
                            },
                            {
                                title: "调入站点",
                                template: function (data) {
                                    return getTextByVal($scope.station, data.inLocation.stationCode)
                                }
                            },
                            {
                                field: "amount", title: "调剂数量(点击修改)", editable: true, kType: 'number'
                            }
                        ]
                    }
                }
            };
        }
    }

    // 伸缩项
    $scope.scaling = function (item, index) {
        item.unfurled = !item.unfurled;
    };

    // 添加货物
    $scope.addCargo = function (item, type) {
        $uibModal.open({
            templateUrl: 'app/bill/plan/modals/addCargoModal.html',
            size: 'lg',
            controller: 'PlanAddCargoCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        item.cargo = data;
                    }
                },
                cargoUnit: function () {
                    return cargoUnit;
                },
                materialUnit: function () {
                    return materialUnit;
                }
            }
        });
    };
    // 添加原料
    $scope.addMaterial = function (item, type) {
        $uibModal.open({
            templateUrl: 'app/bill/plan/modals/addMaterialModal.html',
            size: 'lg',
            controller: 'PlanAddMaterialCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        item.material = data;
                    }
                }
            }
        });
    };

    // 删除货物
    $scope.removeCargo = function (type, index) {
        if (type === 'material') {
            $scope.materialMap.splice(index, 1);
        } else {
            $scope.cargoMap.splice(index, 1);
        }
        hasStation();
    };

    // 清空货物
    $scope.clearCargo = function (item, index) {
        item.cargo = {};
    };
    // 清空原料
    $scope.clearMaterial = function (item, index) {
        item.material = {};
    };

    // 添加站点
    $scope.addStation = function (item, index) {
        if (!$scope.plan.billType) {
            swal('请选择计划类型', '', 'warning');
            return;
        }
        $uibModal.open({
            templateUrl: 'app/bill/plan/modals/addStationModal.html',
            size: 'lg',
            controller: 'PlanAddStationCtrl',
            resolve: {
                billType: function () {
                    return $scope.plan.billType;
                },
                cb: function () {
                    return function (data) {
                        var dataSource = item.stationGrid.kendoGrid.dataSource;
                        var current = _.map(dataSource.data(), function (item) {
                            return item.inLocation.stationCode + '-' + item.outLocation.stationCode;
                        });
                        _.each(data, function (dataItem, index) {
                            if (_.indexOf(current, dataItem.inStationCode + '-' + dataItem.outStationCode) > -1) {
                                var amount = parseInt(dataSource.at(index).get('amount')) + parseInt(dataItem.number)
                                dataSource.at(index).set('amount', amount);
                            } else {
                                item.stationGrid.kendoGrid.dataSource.add({
                                    amount: dataItem.number,
                                    inLocation: {
                                        stationCode: dataItem.inStationCode,
                                        stationName: getTextByVal($scope.station, dataItem.inStationCode)
                                    },
                                    outLocation: {
                                        stationCode: dataItem.outStationCode,
                                        stationName: getTextByVal($scope.station, dataItem.outStationCode)
                                    }
                                });
                            }
                        });
                        hasStation();
                    }
                }
            }
        });
    };

    // 清空站点
    $scope.clearStation = function (item, index) {
        item.stationGrid.kendoGrid.dataSource.data([]);
        hasStation();
    };

    // 判断是否包含站点 用于禁用计划类型
    $scope.isDisableType = false;
    function hasStation() {
        var station = {};
        if ($scope.materialMap.length === 0) {
            station = _.find($scope.cargoMap, function (item) {
                return item.stationGrid.kendoGrid.dataSource.data().length !== 0;
            });
        } else {
            station = _.find($scope.cargoMap, function (item) {
                return item.stationGrid.kendoGrid.dataSource.data().length !== 0;
            });
        }
        $scope.isDisableType = !!station;
    }

    // 保存站点
    $scope.save = function () {
        var plan = _.cloneDeep($scope.plan);
        if (!plan.billName) {
            swal('请选择计划名称', '', 'warning');
            return;
        }
        sendHttpReques('save', plan);
    };

    // 审核站点
    $scope.submit = function () {
        var plan = _.cloneDeep($scope.plan);
        if (!plan.billName) {
            swal('请选择计划名称', '', 'warning');
            return;
        } else if (!plan.billType) {
            swal('请选择计划类型', '', 'warning');
            return;
        }
        sendHttpReques('submit', plan);
    };

    // 发送请求
    function sendHttpReques(type, plan) {
        var url = '';
        if (type === 'save') {
            url = '/api/bill/planBill/create';
        } else {
            url = '/api/bill/planBill/submit';
        }
        if ($scope.materialMap.length === 0) {
            plan.basicEnum = 'BY_CARGO';
            plan.planBillDetailDTOS = _.map($scope.cargoMap, function (item) {
                var stations = _.map(item.stationGrid.kendoGrid.dataSource.data(), function (stationItem) {
                    return {
                        amount: stationItem.amount,
                        inStation: {
                            stationCode: stationItem.inLocation.stationCode
                        },
                        outStation: {
                            stationCode: stationItem.outLocation.stationCode
                        }
                    };
                });
                return {
                    cargoCode: item.cargo.cargoCode,
                    planBillStationDTOS: stations
                };
            });
        } else {
            plan.basicEnum = 'BY_MATERIAL';
            plan.planBillDetailDTOS = _.map($scope.materialMap, function (item) {
                var stations = _.map(item.stationGrid.kendoGrid.dataSource.data(), function (stationItem) {
                    return {
                        amount: stationItem.amount,
                        inStation: {
                            stationCode: stationItem.inLocation.stationCode
                        },
                        outStation: {
                            stationCode: stationItem.outLocation.stationCode
                        }
                    };
                });
                return {
                    rawMaterialCode: item.material.materialCode,
                    planBillStationDTOS: stations
                };
            });
        }
        ApiService.post(url, plan).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error')
            } else {
                swal('操作成功', '', 'success').then(function () {
                    $state.go('app.bill.plan.list');
                });
            }
        }, apiServiceError);
    }
});