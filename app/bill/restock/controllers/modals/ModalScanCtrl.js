'use strict';

angular.module('app').controller('ModalScanCtrl', function ($scope) {
    // 拣货的添加货物
    $scope.item = $scope.cargoObject[$scope.params.scanCode];

    $scope.submitByCargo = function () {
        var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
        if ($scope.item.type === 'add') {
            for (var i = 0; i < dataSource._total; i++) {
                if (dataSource.at(i).cargoCode === $scope.params.scanCode) {
                    if (dataSource.at(i).actualAmount === undefined) {
                        dataSource.at(i).actualAmount = 0
                    }
                    dataSource.at(i).actualAmount = parseInt(dataSource.at(i).actualAmount) + parseInt($scope.item.addNumber)
                }
            }
        } else if ($scope.item.type === 'sub') {
            for (var i = 0; i < dataSource._total; i++) {
                if (dataSource.at(i).cargoCode === $scope.params.scanCode) {
                    dataSource.at(i).actualAmount = parseInt(dataSource.at(i).actualAmount) - parseInt($scope.item.subNumber)
                }
            }
        }
        $scope.cargoGrid.kendoGrid.refresh();
        $scope.addModal.close()

    }


});