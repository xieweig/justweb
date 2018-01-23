'use strict';

angular.module('app').controller('ReturnedScanModalCtrl', function ($scope, data) {
    // 拣货的添加货物
    $scope.item = data.cargo;
    $scope.item.addNumber = 0;
    $scope.item.subNumber = 0;

    var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
    _.each(dataSource.data(), function (item, index) {
        if (item.cargoCode === $scope.item.cargoCode) {
            $scope.item.rawMaterialName = item.rawMaterialName
        }
    });

    $scope.submitByCargo = function () {
        if (isInt($scope.item.addNumber)) {
            if ($scope.item.type === 'add') {
                _.each(dataSource.data(), function (item, index) {
                    if (item.cargoCode === $scope.item.cargoCode) {
                        item.actualAmount = parseInt(item.actualAmount) + parseInt($scope.item.addNumber)
                    }
                })
            } else if ($scope.item.type === 'sub') {
                _.each(dataSource.data(), function (item, index) {
                    if (item.cargoCode === $scope.item.cargoCode) {
                        item.actualAmount = parseInt(item.actualAmount) - parseInt($scope.item.subNumber)
                    }
                })
            }
            $scope.cargoGrid.kendoGrid.refresh();
            $scope.params.scanCode = '';
            $scope.addModal.close()
        }else{
            swal('拣货数量错误', '', 'error');
        }
    };

    function isInt(number) {
        return (parseInt(number) == number && parseInt(number) <= 10000 && parseInt(number) >= 0)
    }
});