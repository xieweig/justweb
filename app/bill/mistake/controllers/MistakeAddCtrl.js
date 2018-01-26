'use strict';

angular.module('app').controller('MistakeAddCtrl', function ($scope, $stateParams, ApiService, $uibModal, cargoUnit, materialUnit) {
    $scope.typeName = $stateParams.typeName;
    $scope.bill = {cargo: {}, material: {}};
    $scope.bySomething = 'cargo';

    $scope.materialStationOpt = {
        single: true,
        callback: function (data) {
            $scope.bill.material.inStationCode = data.stationCode;
        }
    };

    $scope.cargoStationOpt = {
        single: true,
        callback: function (data) {
            $scope.bill.cargo.inStationCode = data.stationCode;
            $scope.bill.cargo.inStationName = data.stationName;
            $scope.bill.cargo.inStationType = data.siteType;
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
                // {title: "操作", width: 80, command: [{name: 'look', text: "查看", click: lookDetails}]},
                {field: "xxxxx", title: "原料编码"},
                {field: "xxxxx", title: "原料名称", width: 120},
                {field: "xxxxx", title: "原料所属分类", width: 120},
                {field: "xxxxx", title: "报溢数量", width: 120},
                {field: "xxxxx", title: "标准单位", width: 120}
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
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit,
                    data: combinationItem($scope.cargoGrid.kendoGrid.dataSource.data()),
                    cb: function (data) {
                        var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
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
                amount: item.amount || 0
            };
        });
    }

    // 提交
    $scope.submit = function () {
        var params = {};
        var dataItem = {}, dataSource = null;
        if ($scope.bySomething === 'cargo') {
            dataItem = $scope.bill.cargo;
            dataSource = $scope.cargoGrid.kendoGrid.dataSource;
        } else {
            dataItem = $scope.bill.material;
            dataSource = $scope.materialGrid.kendoGrid.dataSource;
        }
        params.memo = dataItem.memo;
        params.inLocation = {
            stationCode: dataItem.inStationCode,
            stationName: dataItem.inStationName,
            stationType: getStationType(dataItem.inStationType),
            storage: {
                storageCode: dataItem.storageCode,
                storageName: getTextByVal($scope.outType, dataItem.storageCode)
            }
        };
        params.billDetails = _.map(dataSource.data(), function (item) {
            var result = {
                actualAmount: item.amount,
                actualTotalAmount: item.actualTotalAmount,
                belongMaterialCode: item.rawMaterialCode,
                rawMaterial: {
                    rawMaterialCode: item.rawMaterialCode,
                    rawMaterialName: item.rawMaterialName
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
        ApiService.post('/api/bill/mistake/submitOverFlow', params).then(function () {

        });
    };
});