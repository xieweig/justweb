'use strict';

angular.module('app').controller('DeliveryTransferModalCtrl', function ($scope, $rootScope, $timeout, ApiService, Common, data) {
    $scope.params = {};
    $scope.show = data.type === 'transfer'; // transfer 入库单调拨 view 查看调拨单
    $scope.cargoConfigure = data.cargoUnit;
    $scope.materialConfigure = data.materialUnit;

    $scope.storageType = [
        {value: 'NORMAL', text: '正常库'},
        {value: 'STORAGE', text: '仓储库'},
        {value: 'IN_STORAGE', text: '进货库'},
        {value: 'OUT_STORAGE', text: '退货库'},
        {value: 'ON_STORAGE', text: '在途库'},
        {value: 'RESERVE_STORAGE', text: '预留库'}
    ];

    $scope.inType = [];
    $scope.outType = [];

    $scope.cargoGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            editable: true,
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialName", title: "所属原料"},
                {
                    title: "标准单位", template: function (data) {
                        return getTextByVal($scope.materialConfigure, data.standardUnitCode);
                    }
                },
                {
                    title: "规格", template: function (data) {
                        return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                    }, width: 120
                },
                {field: "actualAmount", title: "入库数量"},
                {
                    title: "入库标准单位数量", template: function (data) {
                        return parseInt(data.number) * parseInt(data.actualAmount)
                    }
                },
                {field: "realAmount", title: '实调数量', editable: true}
            ]
        }
    };

    // 请求单条调剂单详情
    var getURL = '';
    if ($scope.show) {
        getURL = '/api/bill/delivery/findInStorageByBillCode?billCode=';
    } else {
        getURL = '/api/bill/delivery/findAllotByBillCode?billCode=';
    }
    ApiService.get(getURL + data.billCode).then(function (response) {
        if (response.code === '000') {
            var res = response.result.bill;

            $scope.params.billCode = res.billCode;
            $scope.params.createTime = res.createTime;
            $scope.params.basicEnum = res.basicEnum;
            $scope.params.inLocation = res.inLocation;
            $scope.params.outLocation = res.outLocation;
            $scope.params.billProperty = res.billProperty;
            $scope.params.outStationName = getTextByVal($scope.station, res.outLocation.stationCode);
            $scope.params.inStationName = getTextByVal($scope.station, res.inLocation.stationCode);
            $scope.params.outStorageName = getTextByVal($scope.storageType, res.outLocation.storage.storageCode);;
            if (!$scope.show) {
                console.log(res.inStorageBillInStationCode)
                $scope.params.inStorageName = getTextByVal($scope.storageType, res.inLocation.storage.storageCode)
            }else{
                $timeout(function () {
                    $('#select-in').val($scope.storageType[0].value).trigger('change');
                });
            }
            var billDetails = res.billDetails;

            var cargoList = _.map(billDetails, function (item) {
                return item.rawMaterial.cargo.cargoCode
            });

            Common.getCargoByCodes(cargoList).then(function (cargoList) {
                var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                    return item.cargoCode
                }), cargoList);
                var materialList = [];
                _.each(billDetails, function (item) {
                    item.cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                    materialList.push(item.rawMaterial.rawMaterialCode)
                });
                Common.getMaterialByCodes(materialList).then(function (materialList) {
                    var materialObject = _.zipObject(_.map(materialList, function (item) {
                        return item.materialCode
                    }), materialList);
                    _.each(billDetails, function (item) {
                        item.material = materialObject[item.rawMaterial.rawMaterialCode];
                        $scope.cargoGrid.kendoGrid.dataSource.add({
                            cargoName: item.cargo.cargoName,
                            cargoCode: item.cargo.cargoCode,
                            rawMaterialCode: item.material.materialCode,
                            rawMaterialName: item.material.materialName,
                            number: item.cargo.number,
                            standardUnitCode: item.cargo.standardUnitCode,
                            measurementCode: item.cargo.measurementCode,
                            actualAmount: item.actualAmount,
                            realAmount: item.actualAmount
                        })
                    });
                })
            })
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError);

    $scope.bill = {};

    $scope.transfer = function () {
        var url = '/api/bill/delivery/allotSave';
        var bill = _.cloneDeep($scope.bill);

        // bill.billType = '';
        bill.self = $scope.params.specificBillType === 'NO_PLAN';
        bill.billPurpose = 'MOVE_STORAGE';
        bill.specificBillType = 'RESTOCK';
        bill.allowMemo = '';
        bill.basicEnum = $scope.params.basicEnum;
        bill.sourceCode = $scope.params.billCode;
        bill.inStorageBillCode = $scope.params.billCode;
        bill.inStorageBillType = $scope.params.billProperty;

        bill.outLocation = {
            stationCode: $scope.params.outLocation.stationCode,
            storage: {
                storageCode: $scope.params.outLocation.storage.storageCode
            }
        };
        bill.inLocation = {
            stationCode: $scope.params.inLocation.stationCode,
            storage: {
                storageCode: $scope.params.inLocation.storage.storageCode
            }
        };

        // 默认出库是在途库
        bill.inStorageBillInStationCode = $scope.params.inStationType;
        bill.inStorageBillOutStationCode = 'ON_STORAGE';

        bill.billDetails = _.map($scope.cargoGrid.kendoGrid.dataSource.data(), function (item) {
            return {
                rawMaterial: {
                    rawMaterialCode: item.rawMaterialCode,
                    rawMaterialName: item.rawMaterialName,
                    cargo: {
                        cargoCode: item.cargoCode,
                        cargoName: item.cargoName
                    }
                },
                actualAmount: item.realAmount, // 入库数量为入库单的实际数量
                shippedAmount: item.actualAmount // 实调数量
            }
        });
        ApiService.post(url, bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                // alert('success')
                $state.go('app.bill.delivery.transferList');
            }
        }, apiServiceError);
        $scope.cargoGrid.kendoGrid.refresh();
        $scope.$close();
    }

});