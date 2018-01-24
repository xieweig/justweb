'use strict';

angular.module('app').controller('PlanAddStationCtrl', function ($scope, $timeout, cb, billType) {
    var inStationType = '';
    $scope.inStationIsSupplier = false;
    var outStationType = '';
    switch (billType) {
        case 'DELIVERY':
            // 配送
            outStationType = 'LOGISTICS';
            inStationType = 'BOOKSTORE,CAFE,WHOLESALE,STAPLE';
            break;
        case 'RESTOCK':
            // 退库
            outStationType = 'BOOKSTORE,CAFE,WHOLESALE,STAPLE';
            inStationType = 'LOGISTICS';
            break;
        case 'RETURNED':
            // 退货
            outStationType = 'LOGISTICS,BOOKSTORE,CAFE,WHOLESALE,STAPLE';
            $scope.inStationIsSupplier = true;
            break;
        case 'ADJUST':
            // 调剂
            outStationType = 'LOGISTICS,BOOKSTORE,CAFE,WHOLESALE,STAPLE';
            inStationType = 'LOGISTICS,BOOKSTORE,CAFE,WHOLESALE,STAPLE';
            break;
    }

    $scope.stationGrid = {
        primaryId: 'stationCode',
        kendoSetting: {
            height: 150,
            editable: true,
            columns: [
                {command: [{name: 'destroy', text: "删除"}], title: "操作", width: 85},
                {field: "outStationName", title: "调出站点"},
                {field: "inStationName", title: "调入站点"},
                {field: "number", title: "数量(点击修改)", kType: 'number', editable: true}
            ]
        }
    };

    // 一站对多站的选择站点
    $scope.otmOutStation = [];
    $scope.otmOutStationOpt = {
        type: outStationType,
        single: true,
        callback: function (data) {
            $scope.otmOutStation = data;
            // if (billType === 'ADJUST' && $scope.otmInStationOpt.type !== 'supplier') {
            //     $scope.otmInStationOpt.type = data.siteType;
            // }
        }
    };
    $scope.otmInStation = [];
    $scope.otmInStationOpt = {
        type: $scope.inStationIsSupplier ? 'supplier' : inStationType,
        callback: function (data) {
            if (data.length > 0) {
                if (!$scope.inStationIsSupplier) {
                    $scope.otmInStation = data;
                } else {
                    $scope.otmInStation = _.map(data, function (item) {
                        return {
                            stationCode: item.supplierCode,
                            stationName: item.supplierName,
                            stationType: 'SUPPLIER'
                        };
                    })
                }
                // if (billType === 'ADJUST' && $scope.otmInStation[0]) {
                //     $scope.otmOutStationOpt.type = $scope.otmInStation[0].siteType;
                // }
            }
        }
    };

    $scope.otmAddStation = function () {
        var data = [];
        if (!$scope.otmOutStation.stationCode) {
            swal('请选择调出站点', '', 'warning');
            return false;
        } else if ($scope.otmInStation.length === 0) {
            swal('请选择调入站点', '', 'warning');
            return false;
        }
        var repeat = _.find($scope.otmInStation, function (item) {
            if ($scope.otmOutStation.stationCode === item.stationCode) {
                return true;
            }
            data.push({
                outStationCode: $scope.otmOutStation.stationCode,
                outStationName: $scope.otmOutStation.stationName,
                outStationType: $scope.otmOutStation.siteType,
                inStationCode: item.stationCode,
                inStationName: item.stationName,
                inStationType: item.stationType,
                number: 0
            });
            return false;
        });
        if (repeat) {
            swal('不能包含出入库相同的站点', '', 'warning');
        } else {
            addStationToGrid(data);
            $scope.otmOutStation = {};
            $scope.otmInStation = [];
        }
    };

    // 多站对一站的选择站点
    $scope.mtoOutStation = [];
    $scope.mtoOutStationOpt = {
        type: outStationType,
        callback: function (data) {
            $scope.mtoOutStation = data;
            // if (billType === 'ADJUST' && $scope.mtoInStationOpt.type !== 'supplier') {
            //     $scope.mtoInStationOpt.type = data.siteType;
            // }
        }
    };
    $scope.mtoInStation = [];
    $scope.mtoInStationOpt = {
        single: true,
        type: $scope.inStationIsSupplier ? 'supplier' : inStationType,
        callback: function (data) {
            if (!$scope.inStationIsSupplier) {
                $scope.mtoInStation = data;
            } else {
                $scope.mtoInStation = {
                    stationCode: data.supplierCode,
                    stationName: data.supplierName,
                    stationType: 'SUPPLIER'
                }
            }
            // if (billType === 'ADJUST' && $scope.mtoInStation[0]) {
            //     $scope.mtoOutStationOpt.type = $scope.mtoInStation[0].siteType;
            // }
        }
    };

    $scope.mtoAddStation = function () {
        var data = [];
        if ($scope.mtoOutStation.length === 0) {
            swal('请选择调出站点', '', 'warning');
            return false;
        } else if (!$scope.mtoInStation.stationCode) {
            swal('请选择调入站点', '', 'warning');
            return false;
        }
        var repeat = _.find($scope.mtoOutStation, function (item) {
            if ($scope.mtoInStation.stationCode === item.stationCode) {
                return true;
            }
            data.push({
                outStationCode: item.stationCode,
                outStationName: item.stationName,
                outStationType: item.siteType,
                inStationCode: $scope.mtoInStation.stationCode,
                inStationName: $scope.mtoInStation.stationName,
                inStationType: $scope.mtoInStation.stationType,
                number: 0
            });
            return false;
        });
        if (repeat) {
            swal('不能包含出入库相同的站点', '', 'warning');
        } else {
            addStationToGrid(data);
            $scope.mtoOutStation = [];
            $scope.mtoInStation = {};
        }
    };

    // ------------------------------ 一对一的操作 -------------------------------
    // 一站对一站的选择站点
    $scope.otoOutStation = [];
    $scope.otoOutStationOpt = {
        sortable: true,
        onlyLear: true,
        type: outStationType,
        callback: function (data) {
            $scope.otoOutStation = data;
            // if (billType === 'ADJUST' && data[0] && $scope.otoInStationOpt.type !== 'supplier') {
            //     $scope.otoInStationOpt.type = data[0].siteType;
            // }
        }
    };
    $scope.otoInStation = [];
    $scope.otoInStationOpt = {
        sortable: true,
        onlyLear: true,
        type: $scope.inStationIsSupplier ? 'supplier' : inStationType,
        callback: function (data) {
            if (!$scope.inStationIsSupplier) {
                $scope.otoInStation = data;
            } else {
                $scope.otoInStation = _.map(data, function (item) {
                    return {
                        stationCode: item.supplierCode || item.stationCode,
                        stationName: item.supplierName || item.stationName,
                        stationType: 'SUPPLIER'
                    };
                });
            }
            // if (billType === 'ADJUST' && $scope.otoInStation[0]) {
            //     $scope.otoOutStationOpt.type = $scope.otoInStation[0].siteType;
            // }
        }
    };
    // 一对一添加站点
    $scope.otoAddStation = function () {
        if ($scope.otoOutStation.length !== $scope.otoInStation.length) {
            swal('调入站点和调出站点数量不同', '', 'warning');
            return;
        }
        var data = [];
        var repeat = _.find($scope.otoOutStation, function (item, index) {
            var inStation = $scope.otoInStation[index];
            if (inStation.stationCode === item.stationCode) {
                return true;
            }
            data.push({
                outStationCode: item.stationCode,
                outStationName: item.stationName,
                outStationType: item.siteType,
                inStationCode: inStation.stationCode,
                inStationName: inStation.stationName,
                inStationType: inStation.stationType,
                number: 0
            });
            return false;
        });
        if (repeat) {
            swal('不能包含出入库相同的站点', '', 'warning');
        } else {
            addStationToGrid(data);
            $scope.otoOutStation = [];
            $scope.otoInStation = [];
        }
    };

    // 公共的添加方法
    function addStationToGrid(data) {
        var dataSource = $scope.stationGrid.kendoGrid.dataSource;
        var current = _.map(dataSource.data(), function (item) {
            return item.outStationCode + '-' + item.inStationCode;
        });
        var existent = [];
        _.each(data, function (item) {
            if (_.indexOf(current, item.outStationCode + '-' + item.inStationCode) > -1) {
                existent.push(item.outStationName + '-' + item.inStationName);
            } else {
                $scope.stationGrid.kendoGrid.dataSource.add(item);
            }
        });
        if (existent.length > 0) {
            if (existent.length === data.length) {
                swal('操作不成功!', '添加的站点均已存在', 'warning');
            } else {
                swal('操作成功!', '其中 ' + existent.join() + ' 已存在', 'success');
            }
        }
    }

    $scope.add = function () {
        var data = _.map($scope.stationGrid.kendoGrid.dataSource.data(), function (item) {
            return {
                outStationCode: item.outStationCode,
                outStationName: item.outStationName,
                outStationType: item.outStationType,
                inStationCode: item.inStationCode,
                inStationName: item.inStationName,
                inStationType: item.inStationType,
                number: item.number
            }
        });
        cb(data);
        $scope.$close();
    };

    // 删除数组的
    $scope.deleteItem = function (array, index) {
        array.splice(index, 1);
    };
    //  清空
    $scope.clearItem = function (station) {
        station.stationCode = '';
        station.stationName = '';
    }
});