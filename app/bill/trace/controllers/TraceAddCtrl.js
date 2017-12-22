'use strict';

angular.module('app').controller('TraceAddCtrl', function ($scope, $uibModal) {
    $scope.detailsMap = [];
    $scope.detailsGrid = {
        primaryId: 'stationCode',
        params: $scope.kendoQueryCondition,
        kendoSetting: {
            editable: true,
            autoBind: false,
            columns: [
                { selectable: true },
                { field: "sn", title: "出库单号", width: 120 },
                { field: "inStationName", title: "所属包号", width: 120 },
                { field: "inStationName", title: "出库站点", width: 120 },
                { field: "inStationName", title: "入库站点", width: 120 },
                { field: "inStationName", title: "出库时间", width: 120 },
                { field: "inStationName", title: "录单人", width: 120 },
                { field: "inStationName", title: "品种数", width: 120 },
                { field: "inStationName", title: "货物数", width: 120 },
                { command: [{ name: 'destroy', text: "删除" }], title: "操作", width: 155 }
            ]
        }
    };

    /**
     * 打开增加货单明细modal
     */
    $scope.showAddModal = function () {
        $scope.currentDetails = { sn: 1 };
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/trace/modals/addDetails.html',
            scope: $scope,
            size: 'lg'
        });
    }

    /**
     * 增加一条明细
     * @param {*是否点击的下一条 如果点击的下一条需要清空表格数据} isNext 
     */
    $scope.addDetails = function (isNext) {
        if (!$scope.currentDetails.sn) {
            swal('请输入出库单号', '', 'warning');
            return;
        }
        var dataSource = $scope.detailsGrid.kendoGrid.dataSource;
        var repeatIndex = _.findIndex(dataSource.data(), function (item) {
            return item.sn == $scope.currentDetails.sn;
        });
        if (repeatIndex >= 0) {
            swal('该出库单号已存在', '', 'warning');
            return true;
        }
        dataSource.add($scope.currentDetails);
        if (isNext) {
            $scope.currentDetails = {};
        } else {
            $scope.addModal.close();
        }
    }
});