'use strict';

angular.module('app').controller('AdjustPickCtrl', function ($scope, $state, $uibModal, Common, $timeout, ApiService, cargoUnit, materialUnit) {
    $scope.params = {};
    $timeout(function () {
        if ($.cookie('currentStationType') === 'LOGISTICS') {
            $scope.params.outStorageCode = 'STORAGE';
            $('#outStorageCode').val('STORAGE').trigger('change');
        } else {
            $scope.params.outStorageCode = 'NORMAL';
            $('#outStorageCode').val('NORMAL').trigger('change');
        }
    });

    // 搜索条件中的入库站点选择
    $scope.inStationParams = {
        single: true,
        callback: function (data) {
            $scope.params.inStationCode = data.stationCode;
            $scope.params.inStationName = data.stationName;
        }
    };

    $scope.resetPage = function () {
        $state.reload($state.current.name);
    };

    // 搜索
    $scope.search = function () {
        $scope.planGrid.kendoGrid.dataSource.page(1);
    };

    $scope.planGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            persistSelection: true,
            columns: [
                {selectable: true},
                {field: "cargoName", title: "货物名称", width: 120},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {field: "actualAmount", title: "货物数量", width: 120},
                {title: "货物规格", width: 120, template: '#: data.number + data.measurementName #'},
                {
                    title: "标准单位数量", width: 120,
                    template: function (data) {
                        return parseInt(data.actualAmount) * parseInt(data.number);
                    }
                },
                {field: "standardUnitName", title: "标准单位", width: 120}
            ]
        }
    };

    // 原料选择货物
    $scope.chooseCargo = function () {
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/addCargoModal.html',
            size: 'lg',
            controller: 'AdjustAddCargoCtrl',
            resolve: {
                params: {
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit,
                    data: combinationItem($scope.planGrid.kendoGrid.dataSource.data()),
                    cb: function (data) {
                        var dataSource = $scope.planGrid.kendoGrid.dataSource;
                        console.log(data);
                        dataSource.data(combinationItem(data));
                    }
                }
            }
        });
    };

    function combinationItem(dataSource) {
        return _.map(dataSource, function (item) {
            return {
                cargoName: item.cargoName,
                cargoCode: item.cargoCode,
                rawMaterialName: item.rawMaterialName,
                rawMaterialCode: item.rawMaterialCode,
                measurementCode: item.measurementCode,
                measurementName: getTextByVal(cargoUnit, item.measurementCode),
                standardUnitCode: item.standardUnitCode,
                standardUnitName: getTextByVal(materialUnit, item.standardUnitCode),
                number: item.number,
                actualAmount: item.actualAmount || 0
            };
        });
    }

    // 批量删除
    $scope.batchDelete = function () {
        var selectIds = $scope.planGrid.kendoGrid.selectedKeyNames();
        if (selectIds.length === 0) {
            swal('请选择需要删除的项', '', 'warning');
            return;
        }
        var cargoNames = [];
        var dataSource = $scope.planGrid.kendoGrid.dataSource;
        var indexPos = _.chain(dataSource.data()).map(function (item, index) {
            if (_.indexOf(selectIds, '' + item.cargoCode) > -1) {
                cargoNames.push(item.cargoName);
                return index;
            }
        }).reverse().value();
        swal({
            title: '确定要删除' + cargoNames.join() + '吗',
            type: 'warning',
            confirmButtonText: '是的',
            showCancelButton: true
        }).then(function (res) {
            if (res.value) {
                // 根据反序  从最后一条开始删除
                _.each(indexPos, function (item) {
                    if (_.isNumber(item) && item >= 0) {
                        dataSource.remove(dataSource.at(item));
                    }
                });
            }
        });
    };


    // 保存拣货
    $scope.savePick = function () {
        var bill = getParams('save');
        if (bill) {
            ApiService.post('/api/bill/adjust/saveBySelf', bill).then(function (response) {
                if (response.code !== '000') {
                    swal('', response.message, 'error');
                } else {
                    swal('操作成功!', '', 'success').then(function () {
                        $state.go('app.bill.adjust.outStorageList');
                    });
                }
            }, apiServiceError);
        }
    };

    // 提交拣货
    $scope.submitPick = function () {
        var bill = getParams('submit');
        if (bill) {
            ApiService.post('/api/bill/adjust/submitBySelf', bill).then(function (response) {
                if (response.code !== '000') {
                    swal('', response.message, 'error');
                } else {
                    swal('操作成功!', '', 'success').then(function () {
                        $state.go('app.bill.adjust.outStorageList');
                    });
                }
            }, apiServiceError);
        }
    };

    function getParams(type) {
        var dataSource = $scope.planGrid.kendoGrid.dataSource.data();
        if (type === 'submit') {
            if (!$scope.params.outStorageType) {
                swal('请选择出库库位', '', 'warning');
                return false;
            } else if (!$scope.params.inStationCode) {
                swal('请选择入库站点', '', 'warning');
                return false;
            } else if (dataSource.length === 0) {
                swal('请添加货物明细', '', 'warning');
                return false;
            }
        }
        var result = {
            basicEnum: 'BY_CARGO',
            billPurpose: 'OUT_STORAGE',
            specificBillType: 'NO_PLAN',
            sourceBillType: 'NO_PLAN',
            billType: 'ADJUST',
            inLocation: {
                stationCode: $scope.params.inStationCode,
                stationName: $scope.params.inStationName,
                // storage: {
                //     storageCode: 'ON_STORAGE',
                //     storageName: '在途库'
                // }
            },
            outLocation: {
                stationCode: $.cookie('currentStationCode'),
                stationName: $.cookie('currentStationName'),
                storage: {
                    storageCode: $scope.params.outStorageType,
                    storageName: getTextByVal($scope.outType, $scope.params.outStorageType)
                }
            },
            billDetails: []
        };
        var emptyItem = _.find(dataSource, function (dataItem) {
            result.billDetails.push({
                actualAmount: dataItem.actualAmount,
                shippedAmount: 0,
                belongMaterialCode: dataItem.rawMaterialCode,
                rawMaterial: {
                    cargo: {
                        cargoCode: dataItem.cargoCode,
                        cargoName: dataItem.cargoName
                    },
                    rawMaterialCode: dataItem.rawMaterialCode,
                    rawMaterialName: dataItem.rawMaterialName
                }
            });
            return false;
        });
        if (!emptyItem) {
            return result;
        }
        return false;
    }
});