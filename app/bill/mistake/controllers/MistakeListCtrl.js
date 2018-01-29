'use strict';

angular.module('app').controller('MistakeListCtrl', function ($scope, $uibModal, cargoUnit, $stateParams) {
    $scope.typeName = $stateParams.typeName;
    $scope.params = {};
    var kendoGridUrl = '';
    $scope.locationPrefix = '';
    switch ($stateParams.type) {
        case 'overflow':
            kendoGridUrl = '/api/bill/mistake/findOverFlowByConditions';
            $scope.locationPrefix = 'in';
            break;
        case 'loss':
            kendoGridUrl = '/api/bill/mistake/findLossByConditions';
            $scope.locationPrefix = 'out';
            break;
        case 'dayMistake':
            kendoGridUrl = '/api/bill/mistake/findDayMistakeByConditions';
            $scope.locationPrefix = 'out';
            break;
    }
    $scope.params[$scope.locationPrefix + 'StorageCodeSet'] = [];

    // 出库站点选择
    $scope.overflowStation = {
        callback: function (data) {
            $scope.params[$scope.locationPrefix + 'StationCodes'] = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // 搜索
    $scope.search = function () {
        $scope.billGrid.kendoGrid.dataSource.page(1);
    };


    $scope.billGrid = {
        url: kendoGridUrl,
        params: $scope.params,
        dataSource: {
            parameterMap: function (data) {
                if (!data[$scope.locationPrefix + 'StationCodes'] || data[$scope.locationPrefix + 'StationCodes'].length === 0) {
                    data[$scope.locationPrefix + 'StationCodes'] = ['USER_ALL'];
                }
                data.targetEnumSet = [];
                _.each($scope.targetEnumSet, function (item, key) {
                    if (item) {
                        data.targetEnumSet.push(key);
                    }
                });
            }
        },
        kendoSetting: {
            autoBind: false,
            pageable: true,
            columns: [
                {title: "操作", width: 80, command: [{name: 'look', text: "查看", click: lookDetails}]},
                {field: "createTime", title: $stateParams.typeName + "时间", width: 160},
                {
                    title: $stateParams.typeName + "目标", width: 120,
                    template: function (data) {
                        if (data.basicEnum === 'BY_CARGO') {
                            return '货物';
                        }
                        return '原料';
                    }
                },
                {
                    title: $stateParams.typeName + "站点", width: 180,
                    template: function (data) {
                        if (data.inLocation) {
                            return getTextByVal($scope.station, data.inLocation.stationCode);
                        } else if (data.outLocation) {
                            return getTextByVal($scope.station, data.outLocation.stationCode);
                        }
                        return '-';
                    }
                },
                {
                    title: $stateParams.typeName + "库位", width: 120,
                    template: function (data) {
                        if (data.inLocation && data.inLocation.storage) {
                            return getTextByVal($scope.outType, data.inLocation.storage.storageCode);
                        }
                        return '-';
                    }
                },
                {field: "operatorName", title: $stateParams.typeName + "操作人", width: 180}
            ]
        }
    };

    function lookDetails(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $uibModal.open({
            templateUrl: 'app/bill/mistake/modals/billDetailsModal.html',
            size: 'lg',
            controller: 'BillDetailsCtrl',
            resolve: {
                params: {
                    type: $stateParams.type,
                    billCode: dataItem.billCode,
                    cargoUnit: cargoUnit
                }
            }
        });
    }
});