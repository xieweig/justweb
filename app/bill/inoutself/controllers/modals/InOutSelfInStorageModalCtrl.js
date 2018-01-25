'use strict';

angular.module('app').controller('InOutSelfInStorageModalCtrl', function ($scope, $timeout, $uibModal, ApiService, Common, data) {
    /**
     查看入库单弹窗
     */
    $scope.params = {};
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

    $scope.onlyCargoGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialName", title: "所属原料"},
                {
                    field: "standardUnitCode", title: "标准单位", template: function (data) {
                        return getTextByVal($scope.materialConfigure, data.standardUnitCode);
                    }
                },
                {
                    title: "规格", template: function (data) {
                        return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                    }
                },
                // {field: "shippedAmount", title: "应拣数量"},
                {field: "actualAmount", title: "实拣数量"},
                {
                    title: "标准单位数量", template: function (data) {
                        return parseInt(data.number) * parseInt(data.actualAmount)
                    }
                }
            ]
        }
    };

    // 查看单条计划详情
    var getURL = '/api/bill/inOutSelf/findInStorageByBillCode';
    ApiService.get(getURL + '?billCode=' + data.billCode).then(function (response) {
        if (response.code = '000') {
            var res = response.result.bill;
            _.each(['billCode', 'createTime', 'inWareHouseTime', 'inLocation', 'outLocation', 'planMemo', 'operatorName', 'totalVarietyAmount', 'totalAmount',
                'auditMemo', 'outStorageMemo'], function (name) {
                $scope.params[name] = res[name]
            });
            $scope.params.billType = getTextByVal($scope.specificType, res.specificBillType) + '转';
            $scope.params.inStationName = getTextByVal($scope.station, res.inLocation.stationCode);
            $scope.params.outStationName = getTextByVal($scope.station, res.outLocation.stationCode);
            $scope.params.inStorageName = getTextByVal($scope.storageType, res.inLocation.storage.storageCode);
            $scope.params.outStorageName = getTextByVal($scope.storageType, res.outLocation.storage.storageCode);
            var billDetails = [], cargoList = [];
            billDetails = res.billDetails;
            cargoList = _.map(billDetails, function (item) {
                return item.rawMaterial.cargo.cargoCode
            });
            Common.getCargoByCodes(cargoList).then(function (cargoList) {
                var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                    return item.cargoCode
                }), cargoList);

                var materialList = [];

                _.each(billDetails, function (item) {
                    // 将相应货物信息添加进billDetails
                    item.cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                    materialList.push(item.rawMaterial.rawMaterialCode)
                });

                Common.getMaterialByCodes(materialList).then(function (materialList) {
                    var materialObject = _.zipObject(_.map(materialList, function (item) {
                        return item.materialCode
                    }), materialList);
                    _.each(billDetails, function (item) {
                        // materialList: 原料详细信息
                        item.material = materialObject[item.rawMaterial.rawMaterialCode];
                        $scope.onlyCargoGrid.kendoGrid.dataSource.add({
                            cargoName: item.cargo.cargoName,
                            cargoCode: item.cargo.cargoCode,
                            rawMaterialName: item.material.materialName,
                            number: item.cargo.number,
                            standardUnitCode: item.cargo.standardUnitCode,
                            amount: item.cargo.amount,
                            actualAmount: item.actualAmount,
                            shippedAmount: item.shippedAmount,
                            measurementCode: item.cargo.measurementCode
                        })
                    })
                })
            })
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError);

    // 导出
    $scope.export = function () {
        alert('export')
    };
});