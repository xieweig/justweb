'use strict';

angular.module('app').controller('MistakeAddCtrl', function ($scope, $stateParams, ApiService, $state, $uibModal, cargoUnit, materialUnit) {
    $scope.typeName = $stateParams.typeName;
    $scope.bill = {cargo: {}, material: {}};

    var submitUrl = '';
    $scope.locationPrefix = '';
    switch ($stateParams.type) {
        case 'overflow':
            submitUrl = '/api/bill/mistake/submitOverFlow';
            $scope.locationPrefix = 'in';
            break;
        case 'loss':
            submitUrl = '/api/bill/mistake/submitLoss';
            $scope.locationPrefix = 'out';
            break;
        case 'dayMistake':
            submitUrl = '/api/bill/mistake/submitDayMistake';
            $scope.locationPrefix = 'out';
            break;
    }

    $scope.bySomething = 'material';
    $('#tabHead').on('click', 'a', function () {
        $scope.bySomething = $(this).attr('data-type');
    });

    $scope.materialStationOpt = {
        single: true,
        callback: function (data) {
            $scope.bill.material[$scope.locationPrefix + 'StationCode'] = data.stationCode;
            $scope.bill.material[$scope.locationPrefix + 'StationName'] = data.stationName;
            $scope.bill.material[$scope.locationPrefix + 'StationType'] = data.siteType;
        }
    };

    $scope.cargoStationOpt = {
        single: true,
        callback: function (data) {
            $scope.bill.cargo[$scope.locationPrefix + 'StationCode'] = data.stationCode;
            $scope.bill.cargo[$scope.locationPrefix + 'StationName'] = data.stationName;
            $scope.bill.cargo[$scope.locationPrefix + 'StationType'] = data.siteType;
        }
    };

    // 原料表
    $scope.materialGrid = {
        dataSource: {
            data: function () {
                return [{type: 'cargo'}, {type: 'material'}];
            }
        },
        kendoSetting: {
            columns: [
                {field: "materialName", title: "原料名称"},
                {field: "materialCode", title: "原料编码", width: 120},
                {field: "materialTypeName", title: "所属原料", width: 120},
                {field: "standardUnit", title: "最小标准单位", width: 120},
                {field: "amount", title: "货物数量", width: 120}
            ]
        }
    };

    // 货物表
    $scope.cargoGrid = {
        dataSource: {
            data: function () {
                return [{type: 'cargo'}, {type: 'material'}];
            }
        },
        kendoSetting: {
            columns: [
                // {title: "操作", width: 80, command: [{name: 'look', text: "查看", click: lookDetails}]},
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {title: "规格", width: 120, template: '#: data.number + data.measurementName #'},
                {field: "amount", title: "货物数量", width: 120}
            ]
        }
    };

    // 原料选择货物
    $scope.chooseCargo = function () {
        $uibModal.open({
            templateUrl: 'app/bill/adjust/modals/addCargoModal.html',
            size: 'lg',
            controller: 'MistakeAddCargoCtrl',
            resolve: {
                params: {
                    typeName: $stateParams.typeName,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit,
                    data: combinationCargoItem($scope.cargoGrid.kendoGrid.dataSource.data()),
                    cb: function (data) {
                        var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
                        console.log(data);
                        dataSource.data(combinationCargoItem(data));
                    }
                }
            }
        });
    };

    function combinationCargoItem(dataSource) {
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
                amount: item.amount || 0
            };
        });
    }

    // 原料选择货物
    $scope.chooseMaterial = function () {
        $uibModal.open({
            templateUrl: 'app/bill/mistake/modals/addMaterialModal.html',
            size: 'lg',
            controller: 'MistakeAddMaterialCtrl',
            resolve: {
                params: {
                    typeName: $stateParams.typeName,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit,
                    data: combinationMaterialItem($scope.materialGrid.kendoGrid.dataSource.data()),
                    cb: function (data) {
                        var dataSource = $scope.materialGrid.kendoGrid.dataSource;
                        console.log(data);
                        dataSource.data(combinationMaterialItem(data));
                    }
                }
            }
        });
    };

    function combinationMaterialItem(dataSource) {
        return _.map(dataSource, function (item) {
            return {
                materialCode: item.materialCode,
                materialName: item.materialName,
                materialTypeName: item.materialTypeName,
                materialTypeCode: item.materialTypeCode,
                standardUnit: item.standardUnit,
                amount: item.amount || 0
            };
        });
    }

    // 提交
    $scope.submit = function () {
        var params = {};
        var dataItem = {}, dataSource = null;
        if ($scope.bySomething === 'cargo') {
            params.basicEnum = 'BY_CARGO';
            dataItem = $scope.bill.cargo;
            dataSource = $scope.cargoGrid.kendoGrid.dataSource.data();
        } else {
            params.basicEnum = 'BY_MATERIAL';
            dataItem = $scope.bill.material;
            dataSource = $scope.materialGrid.kendoGrid.dataSource.data();
        }
        if (!dataItem[$scope.locationPrefix + 'StationCode']) {
            swal('请选择' + $scope.typeName + '站点', '', 'warning');
            return
        } else if (!dataItem.storageCode) {
            swal('请选择库位', '', 'warning');
            return
        } else if (!dataItem.memo) {
            swal('请填写备注', '', 'warning');
            return
        } else if (dataSource.length === 0) {
            swal('请添加' + $scope.typeName + '目标', '', 'warning');
            return
        }
        params.memo = dataItem.memo;
        if ($scope.locationPrefix === 'in') {
            params.inLocation = {
                stationCode: dataItem[$scope.locationPrefix + 'StationCode'],
                stationName: dataItem[$scope.locationPrefix + 'StationName'],
                stationType: getStationType(dataItem[$scope.locationPrefix + 'StationType']),
                storage: {
                    storageCode: dataItem.storageCode,
                    storageName: getTextByVal($scope.outType, dataItem.storageCode)
                }
            };
        } else {
            params.outLocation = {
                stationCode: dataItem[$scope.locationPrefix + 'StationCode'],
                stationName: dataItem[$scope.locationPrefix + 'StationName'],
                stationType: getStationType(dataItem[$scope.locationPrefix + 'StationType']),
                storage: {
                    storageCode: dataItem.storageCode,
                    storageName: getTextByVal($scope.outType, dataItem.storageCode)
                }
            };
        }
        params.billDetails = _.map(dataSource, function (item) {
            var result = {
                actualAmount: item.amount,
                actualTotalAmount: item.number ? parseInt(item.number) * parseInt(item.amount) : item.amount,
                belongMaterialCode: item.rawMaterialCode,
                rawMaterial: {
                    rawMaterialCode: item.rawMaterialCode || item.materialCode,
                    rawMaterialName: item.rawMaterialName || item.materialName
                }
            };
            if ($scope.bySomething === 'cargo') {
                result.rawMaterial.cargo = {
                    cargoCode: item.cargoCode,
                    cargoName: item.cargoName
                };
            }
            return result;
        });
        ApiService.post(submitUrl, params).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功', '', 'success').then(function () {
                    $state.go('app.bill.mistake.overflowList');
                });
            }
        });
    };
});