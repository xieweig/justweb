'use strict';

angular.module('app').controller('BillDetailsCtrl', function ($scope, ApiService, $uibModal, Common, params) {
    (function () {
        var searchUrl = '';
        switch (params.type) {
            case 'overflow':
                searchUrl = '/api/bill/mistake/findOverFlowByBillCode?billCode=' + params.billCode;
                break;
            case 'loss':
                searchUrl = '/api/bill/mistake/findLossByBillCode?billCode=' + params.billCode;
                break;
            case 'dayMistake':
                searchUrl = '/api/bill/mistake/findDayMistakeByBillCode?billCode=' + params.billCode;
                break;
        }
        ApiService.get(searchUrl).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                $scope.billDetails = response.result.bill;
                $scope.billDetails.basicEnumName = $scope.billDetails.basicEnum === 'BY_CARGO' ? '原料' : '货物';
                if ($scope.billDetails.inLocation) {
                    $scope.billDetails.inLocation.stationName = getTextByVal($scope.station, $scope.billDetails.inLocation.stationCode);
                    if ($scope.billDetails.inLocation.storage) {
                        $scope.billDetails.inLocation.storage.storageName = getTextByVal($scope.outType, $scope.billDetails.inLocation.storage.storageCode);
                    }
                }
                initTarget();
            }

        }, apiServiceError);
    }());

    function initTarget() {
        var targetCodes = [];
        targetCodes = _.map($scope.billDetails.billDetails, function (item) {
            console.log(item);
            if ($scope.billDetails.basicEnum === 'BY_CARGO') {
                return item.rawMaterial.cargo.cargoCode;
            } else {
                return item.rawMaterial.rawMaterialCode;
            }
        });

        if ($scope.billDetails.basicEnum === 'BY_CARGO') {
            Common.getCargoByCodes(targetCodes).then(function (cargoList) {
                $scope.detailsGrid = {
                    kendoSetting: {
                        dataSource: cargoList,
                        columns: [
                            {field: "cargoName", title: "货物名称"},
                            {field: "cargoCode", title: "货物编码", width: 120},
                            {field: "rawMaterialName", title: "所属原料", width: 120},
                            {
                                title: "规格", width: 120,
                                template: function (data) {
                                    return data.number + getTextByVal(params.cargoUnit, data.measurementCode);
                                }
                            }
                        ]
                    }
                };
            });
        } else {
            Common.getMaterialByCodes(targetCodes).then(function (materialList) {
                $scope.detailsGrid = {
                    kendoSetting: {
                        dataSource: materialList,
                        columns: [
                            {field: "materialName", title: "原料名称"},
                            {field: "materialCode", title: "原料编码", width: 120},
                            {field: "materialTypeName", title: "原料分类", width: 120},
                            {field: "standardUnitName", title: "最小标准单位", width: 120},
                            {field: "memo", title: "备注", width: 120}
                        ]
                    }
                };
            });
        }
    }

});