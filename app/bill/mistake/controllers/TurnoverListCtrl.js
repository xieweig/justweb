'use strict';

angular.module('app').controller('TurnoverListCtrl', function ($scope, $uibModal, cargoUnit, materialUnit) {
    $scope.params = {inStorageCode: [], outStorageCode: []};

    // 出库站点选择
    $scope.outStationOpt = {
        callback: function (data) {
            $scope.params.outStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };
    $scope.inStationOpt = {
        callback: function (data) {
            $scope.params.inStationCodes = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索
    $scope.search = function () {
        $scope.billGrid.kendoGrid.dataSource.page(1);
    };
    $scope.billGrid = {
        url: '/api/bill/mistake/findMistakeByConditions',
        params: $scope.params,
        dataSource: {
            parameterMap: function (data) {
                data.inStorageCode = '';
                data.outStorageCode = '';
                if (!data.outStationCodes || data.outStationCodes.length === 0) {
                    data.outStationCodes = ['USER_ALL'];
                }
                if (!data.inStationCodes || data.inStationCodes.length === 0) {
                    data.inStationCodes = ['USER_ALL'];
                }
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            dataSource: [{billCode: 'TMCKHDQA0020180240I6K000001'}],
            height: 500,
            columns: [
                {title: "操作", width: 80, locked: true, command: [{name: 'look', text: "查看", click: lookDetails}]},
                {field: "mistakeBillCode", title: "流转误差单号", width: 120},
                {field: "billCode", title: "调拨单号", width: 120},
                {
                    title: "调拨单调出库位", width: 120,
                    template: function (dataItem) {
                        if (dataItem.outLocation && dataItem.outLocation.storage && dataItem.outLocation.storage.storageCode) {
                            return getTextByVal($scope.outType, dataItem.outLocation.storage.storageCode);
                        }
                        return '';
                    }
                },
                {
                    title: "调拨单调入库位", width: 120,
                    template: function (dataItem) {
                        if (dataItem.inLocation && dataItem.inLocation.storage && dataItem.inLocation.storage.storageCode) {
                            return getTextByVal($scope.outType, dataItem.inLocation.storage.storageCode);
                        }
                        return '';
                    }
                },
                {
                    title: "入库单调出站点", width: 120,
                    template: function (dataItem) {
                        if (dataItem.outLocation && dataItem.outLocation.stationCode) {
                            return getTextByVal($scope.station, dataItem.outLocation.stationCode);
                        }
                        return '';
                    }
                },
                {
                    title: "入库单调入站点", width: 120,
                    template: function (dataItem) {
                        if (dataItem.inLocation && dataItem.inLocation.stationCode) {
                            return getTextByVal($scope.station, dataItem.inLocation.stationCode);
                        }
                        return '';
                    }
                },
                {field: "operatorName", title: "调拨人", width: 120},
                {field: "createTime", title: "调拨时间", width: 120},
                {field: "totalVarietyAmount", title: "总误差", width: 120}
            ]
        }
    };

    function lookDetails(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/mistake/modals/turnoverDetails.html',
            size: 'lg',
            controller: 'TurnoverDetailsCtrl',
            resolve: {
                params: {
                    billCode: dataItem.billCode,
                    cargoUnit: cargoUnit,
                    materialUnit: materialUnit
                }
            }
        });
    }
});