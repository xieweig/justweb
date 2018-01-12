'use strict';

angular.module('app').controller('PlanAddStationCtrl', function ($scope, $timeout, cb, billType) {
    var inStationType = '';
    $scope.inStationIsSupplier = false;
    var outStationType = '';
    switch (billType) {
        case 'DELIVERY':
            // 配送
            outStationType = 'LOGISTICS';
            inStationType = ['BOOKSTORE', 'CAFE'];
            break;
        case 'RESTOCK':
            // 退库
            outStationType = ['BOOKSTORE', 'CAFE'];
            inStationType = 'LOGISTICS';
            break;
        case 'RETURNED':
            // 退货
            outStationType = 'LOGISTICS';
            $scope.inStationIsSupplier = true;
            break;
    }

    $scope.stationGrid = {
        primaryId: 'stationCode',
        kendoSetting: {
            height: 150,
            editable: true,
            columns: [
                {command: [{name: 'destroy', text: "删除"}], title: "操作", width: 85, locked: true},
                {field: "outStationName", title: "调出站点"},
                {field: "inStationName", title: "调入站点"},
                {field: "number", title: "数量(点击修改)", editable: true}
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
        }
    };
    $scope.otmInStation = [];
    $scope.otmInStationOpt = {
        type: $scope.inStationIsSupplier ? 'supplier' : inStationType,
        callback: function (data) {
            $scope.otmInStation = data;
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
        _.each($scope.otmInStation, function (item) {
            data.push({
                outStationCode: $scope.otmOutStation.stationCode,
                outStationName: $scope.otmOutStation.stationName,
                inStationCode: item.stationCode,
                inStationName: item.stationName,
                number: 0,
            });
        });
        addStationToGrid(data);
    };

    // 多站对一站的选择站点
    $scope.mtoOutStation = [];
    $scope.mtoOutStationOpt = {
        type: outStationType,
        callback: function (data) {
            $scope.mtoOutStation = data;
        }
    };
    $scope.mtoInStation = [];
    $scope.mtoInStationOpt = {
        single: true,
        type: $scope.inStationIsSupplier ? 'supplier' : inStationType,
        callback: function (data) {
            $scope.mtoInStation = data;
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
        _.each($scope.mtoOutStation, function (item) {
            data.push({
                outStationCode: item.stationCode,
                outStationName: item.stationName,
                inStationCode: $scope.mtoInStation.stationCode,
                inStationName: $scope.mtoInStation.stationName,
                number: 0
            });
        });
        addStationToGrid(data);
    };

    // ------------------------------ 一对一的操作 -------------------------------
    // 一站对一站的选择站点
    $scope.otoOutStation = [];
    $scope.otoOutStationOpt = {
        sortable: true,
        onlyLear: true,
        type: outStationType,
        callback: function (data) {
            console.log(data);
            $scope.otoOutStation = data;
        }
    };
    $scope.otoInStation = [];
    $scope.otoInStationOpt = {
        sortable: true,
        onlyLear: true,
        type: $scope.inStationIsSupplier ? 'supplier' : inStationType,
        callback: function (data) {
            $scope.otoInStation = data;
        }
    };
    // 一对一添加站点
    $scope.otoAddStation = function () {
        if ($scope.otoOutStation.length !== $scope.otoInStation.length) {
            swal('调入站点和调出站点数量不同', '', 'warning');
            return;
        }
        var data = [];
        _.each($scope.otoOutStation, function (item, index) {
            var inStation = $scope.otoInStation[index];
            data.push({
                outStationCode: item.stationCode,
                outStationName: item.stationName,
                inStationCode: inStation.stationCode,
                inStationName: inStation.stationName,
                number: 0
            });
        });
        addStationToGrid(data);
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
            swal('操作成功!', '其中 ' + existent.join() + ' 已存在', 'success');
        }
    }

    $scope.add = function () {
        var data = _.map($scope.stationGrid.kendoGrid.dataSource.data(), function (item) {
            return {
                outStationCode: item.outStationCode,
                outStationName: item.outStationName,
                inStationCode: item.inStationCode,
                inStationName: item.inStationName,
                number: item.number
            }
        });
        cb(data);
        $scope.$close();
    }
});