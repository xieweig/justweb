'use strict';

angular.module('app').controller('PlanAddCtrl', function ($scope, $timeout, $uibModal) {
    $timeout(function () {
        var isTrigger = false;
        $('.nav-tabs a').click(function () {
            var $this = $(this);
            if (!isTrigger) {
                swal({
                    title: '该操作将会清空原有的数据,确定继续?',
                    showCancelButton: true,
                    type: "warning"
                }).then(function (result) {
                    if (!result.value) {
                        isTrigger = true;
                        $this.parent().siblings().find('a').trigger('click');
                    } else {
                        var tabType = $this.attr('tabType');
                        if (tabType === 'cargo') {
                            $scope.materialMap = [];
                        } else if (tabType === 'material') {
                            $scope.cargoMap = [];
                        }
                    }
                });
            } else {
                // 程序只会触发一次
                isTrigger = false;
            }
        });
    });

    $('#grid').on('click', '.kendo-btn-a', function () {

    })


    // 项目数组
    $scope.cargoMap = [];
    $scope.materialMap = [];
    $scope.addItem = function (type) {
        var item = {
            unfurled: true,
            cargo: {},
            stationGrid: {
                primaryId: 'stationCode',
                kendoSetting: {
                    height: 150,
                    editable: true,
                    autoBind: false,
                    columns: [
                        { command: [{ name: 'destroy', text: "删除" }], title: "操作", width: 85, locked: true },
                        { field: "inStationName", title: "调出站点" },
                        { field: "outStationName", title: "调入站点" },
                        { field: "number", title: "调剂数量(点击修改)", editable: true }
                    ]
                }
            }
        }
        if (type === 'material') {
            $scope.materialMap.push(item);
        } else {
            $scope.cargoMap.push(item);
        }
    };

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
                        item.cargo = {
                            cargoName: '货物',
                            cargoCode: 'CODE001',
                            barCode: '1564646465',
                            selfBarCode: '1564646465',
                            materialName: '咖啡豆',
                            number: '100',
                            measurementName: 'g/包',
                            class: '分类'
                        };
                    }
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
                        item.material = {
                            materialName: '原料',
                            materialCode: 'CODE001',
                        };
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
    };

    // 清空货物
    $scope.clearCargo = function (item, index) {
        item.cargo = {};
    };

    // 添加站点
    $scope.addStation = function (item, index) {
        $uibModal.open({
            templateUrl: 'app/bill/plan/modals/addStationModal.html',
            size: 'lg',
            controller: 'PlanAddStationCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        _.each(data, function (dataItem) {
                            item.stationGrid.kendoGrid.dataSource.add(dataItem)
                        });
                    }
                }
            }
        });
    };
    // 清空站点
    $scope.clearStation = function (item, index) {
        item.stationGrid.kendoGrid.dataSource.data([]);
    };
});