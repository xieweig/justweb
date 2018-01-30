'use strict';

angular.module('app').controller('TurnoverDetailsCtrl', function ($scope, ApiService, Common, params) {
    (function () {
        if (!params.billCode) {
            swal('没有单号', '', 'warning');
            $scope.$close();
            return;
        }
        ApiService.get('/api/bill/mistake/findAllotByBillCode?billCode=' + params.billCode).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                initGrid(response.result.bill);
            }
        });
    }());

    function initGrid(billDetails) {
        $scope.billDetails = billDetails;

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


        var cargoCodes = _.map(billDetails.billDetails, function (item) {
            return item.rawMaterial.cargo.cargoCode;
        });

        Common.getCargoByCodes(cargoCodes).then(function (cargoList) {
            var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                return item.cargoCode
            }), cargoList);

            var dataSource = _.map(billDetails.billDetails, function (item) {
                var cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                cargo.measurementName = getTextByVal(params.cargoUnit, cargo.measurementCode);
                cargo.standardUnitName = getTextByVal(params.materialUnit, cargo.standardUnitCode);
                cargo.standardUnitNumber = cargo.number * item.shippedAmount;
                cargo.shippedAmount = item.shippedAmount;
                cargo.actualAmount = item.actualAmount;
                cargo.amountMistake = item.shippedAmount - item.actualAmount;
                cargo.materialMistake = cargo.amountMistake * cargo.number;
                return cargo;
            });
            $scope.detailsGrid = {
                kendoSetting: {
                    dataSource: dataSource,
                    columns: [
                        {field: "cargoName", title: "货物名称", width: 120},
                        {field: "cargoCode", title: "货物编码", width: 120},
                        {field: "rawMaterialName", title: "所属原料", width: 120},
                        {field: "standardUnitName", title: "标准单位", width: 120},
                        {title: "规格", width: 120, template: '#: data.number + data.measurementName #'},
                        {field: "shippedAmount", title: "调拨数量", width: 120},
                        {field: "standardUnitNumber", title: "调拨标准单位数量", width: 120},
                        {field: "actualAmount", title: "实调数量", width: 120},
                        {field: "amountMistake", title: "货物误差", width: 120},
                        {field: "materialMistake", title: "原料误差", width: 120}
                    ]
                }
            };
        });
    }
});