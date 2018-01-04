'use strict';

angular.module('app').controller('ModalScanCtrl', function ($scope) {
    // 拣货的添加货物
    $scope.item = {};

    $scope.submitByCargo = function () {
        var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
        if ($scope.item.type === 'add') {
            for (var i = 0; i < dataSource._total; i++) {
                if (dataSource.at(i).cargoCode === 'hw001') {
                    dataSource.at(i).realNumber = parseInt(dataSource.at(i).realNumber) + parseInt($scope.item.addNumber)
                }
            }
        } else if ($scope.item.type === 'sub') {
            for (var i = 0; i < dataSource._total; i++) {
                if (dataSource.at(i).cargoCode === 'hw001') {
                    dataSource.at(i).realNumber = parseInt(dataSource.at(i).realNumber) - parseInt($scope.item.subNumber)
                }
            }
        }
        $scope.cargoGrid.kendoGrid.refresh();
        $scope.addModal.close()

    }


});