'use strict';

angular.module('app').controller('AdjustTransfersCtrl', function ($scope, ApiService, Common, params) {
    if (params.billCode) {
        if (params.sourceType === 'new') {
            ApiService.get('/api/bill/adjust/findInStorageByBillCode?billCode=' + params.billCode).then(function (response) {
                if (response.code !== '000') {
                    swal('', response.message, 'error').then(function () {
                        $scope.$close();
                    });
                } else {
                    if (!response.result.bill) {
                        swal('未找到单据', '', 'warning').then(function () {
                            $scope.$close();
                        });
                        return;
                    }
                    initBillDetails(response.result.bill);
                }
            });
        } else if (params.sourceType === 'old') {
            ApiService.get('/api/bill/adjust/findAllotByBillCode?billCode=' + params.billCode).then(function (response) {
                if (response.code !== '000') {
                    swal('', response.message, 'error').then(function () {
                        $scope.$close();
                    });
                } else {
                    if (!response.result.bill) {
                        swal('未找到单据', '', 'warning').then(function () {
                            $scope.$close();
                        });
                        return;
                    }
                    initBillDetails(response.result.bill);
                }
            });
        }
    }

    // 初始化详情
    function initBillDetails(bill) {
        $scope.billDetails = bill;
        $scope.billDetails.sourceType = params.sourceType;
        $scope.billDetails.sourceBillTypeName = getTextByVal($scope.sourceBillType, $scope.billDetails.sourceBillType);
        if ($scope.billDetails.inLocation) {
            $scope.billDetails.inLocation.stationName = getTextByVal($scope.station, $scope.billDetails.inLocation.stationCode);
            if ($scope.billDetails.inLocation.storage) {
                $scope.billDetails.inLocation.storage.storageName = getTextByVal($scope.outType, $scope.billDetails.inLocation.storage.storageCode);
            }
        }
        if ($scope.billDetails.outLocation) {
            $scope.billDetails.outLocation.stationName = getTextByVal($scope.station, $scope.billDetails.outLocation.stationCode);
            if ($scope.billDetails.outLocation.storage) {
                $scope.billDetails.outLocation.storage.storageName = getTextByVal($scope.outType, $scope.billDetails.outLocation.storage.storageCode);
            }
        }

        var cargoCodes = _.map($scope.billDetails.billDetails, function (item) {
            return item.rawMaterial.cargo.cargoCode;
        });
        Common.getCargoByCodes(cargoCodes).then(function (cargoList) {
            var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                return item.cargoCode
            }), cargoList);
            $scope.detailsGrid = {
                kendoSetting: {
                    editable: true,
                    dataSource: _.map($scope.billDetails.billDetails, function (item) {
                        var cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                        cargo.shippedAmount = item.shippedAmount;
                        cargo.actualAmount = item.actualAmount;
                        cargo.amount = item.actualAmount;
                        cargo.measurementName = getTextByVal(params.cargoUnit, cargo.measurementCode);
                        cargo.standardUnitName = getTextByVal(params.materialUnit, cargo.standardUnitCode);
                        return cargo;
                    }),
                    columns: [
                        {field: "cargoName", title: "货物名称", width: 120},
                        {field: "cargoCode", title: "货物编码", width: 120},
                        {field: "rawMaterialName", title: "所属原料", width: 120},
                        {field: "standardUnitName", title: "标准单位", width: 120},
                        {title: "规格", width: 120, template: '#: data.number + data.measurementName #'},
                        {field: "actualAmount", title: "入库数量", width: 120},
                        {field: "shippedAmount", title: "入库标准单位数量", width: 120},
                        {field: "amount", title: "实调数量", width: 120, editable: true, kType: 'number'}
                    ]
                }
            }
        });
    }

    // 调拨
    $scope.transfers = function () {
        if (!$scope.billDetails.inLocation || !$scope.billDetails.inLocation.storage || !$scope.billDetails.inLocation.storage.storageCode) {
            swal('请选择入库库位', '', 'warning');
            return;
        }
        var sendParams = {
            billPurpose: 'MOVE_STORAGE',
            specificBillType: 'ADJUST',
            sourceBillType: $scope.billDetails.sourceBillType,
            basicEnum: $scope.billDetails.basicEnum,
            sourceCode: $scope.billDetails.billCode,
            inStorageBillCode: $scope.billDetails.inStorageBillCode,
            outLocation: $scope.billDetails.outLocation,
            inLocation: $scope.billDetails.inLocation,
            inStorageBillOutStationCode: $scope.billDetails.outLocation.stationCode,
            inStorageBillInStationCode: $scope.billDetails.inLocation.stationCode,
            billDetails: []
        };
        _.each($scope.detailsGrid.kendoGrid.dataSource.data(), function (item) {
            sendParams.billDetails.push({
                rawMaterial: {
                    rawMaterialCode: item.rawMaterialCode,
                    rawMaterialName: item.rawMaterialName,
                    cargo: {
                        cargoCode: item.cargoCode,
                        cargoName: item.cargoName
                    }
                },
                actualAmount: item.amount,
                shippedAmount: item.actualAmount
            });
        });
        ApiService.post('/api/bill/adjust/allotSave', sendParams).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功!', '', 'success').then(function () {
                    $scope.$close();
                });
            }
        }, apiServiceError);
    };
});