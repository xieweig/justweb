'use strict';

angular.module('app').controller('PlanAddStationCtrl', function ($scope, $timeout, cb) {
    $scope.stationGrid = {
        primaryId: 'stationCode',
        kendoSetting: {
            height: 150,
            editable: true,
            columns: [
                { command: [{ name: 'destroy', text: "删除" }], title: "操作", width: 85, locked: true },
                { field: "outStationName", title: "调出站点" },
                { field: "inStationName", title: "调入站点" },
                { field: "number", title: "数量(点击修改)", editable: true }
            ]
        }
    };

    // 一站对多站的选择站点
    $scope.otmOutStation = [];
    $scope.otmOutStationOpt = {
        single: true,
        callback: function (data) {
            $scope.otmOutStation = data;
        }
    };
    $scope.otmInStation = [];
    $scope.otmInStationOpt = {
        callback: function (data) {
            $scope.otmInStation = data;
        }
    };

    $scope.otmAddStation = function () {
        var data = [];
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
        callback: function (data) {
            $scope.mtoOutStation = data;
        }
    };
    $scope.mtoInStation = [];
    $scope.mtoInStationOpt = {
        single: true,
        callback: function (data) {
            $scope.mtoInStation = data;
        }
    };

    $scope.mtoAddStation = function () {
        var data = [];
        _.each($scope.mtoOutStation, function (item) {
            data.push({
                outStationCode: item.stationCode,
                outStationName: item.stationName,
                inStationCode: $scope.mtoInStation.stationCode,
                inStationName: $scope.mtoInStation.stationName,
                number: 0,
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
        callback: function (data) {
            console.log(data);
            $scope.otoOutStation = data;
        }
    };
    $scope.otoInStation = [];
    $scope.otoInStationOpt = {
        sortable: true,
        onlyLear: true,
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
        _.each(data, function (item) {
            $scope.stationGrid.kendoGrid.dataSource.add(item);
        });
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