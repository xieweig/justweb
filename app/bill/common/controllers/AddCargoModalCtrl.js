'use strict';

angular.module('app').controller('AddCargoModalCtrl', function ($scope, cb) {
    $scope.params = {};
    $scope.search = function () {
        $scope.cargoList.kendoGrid.dataSource.page(1);
    };
    // 条件查询的货物列表
    $scope.cargoList = {
        url: COMMON_URL.baseInfo + '/api/v1/baseInfo/cargo/findByCondition',
        params: $scope.params,
        primaryId: 'cargoCode',
        kendoSetting: {
            autoBind: false,
            persistSelection: true,
            pageable: true,
            height: 300,
            columns: [
                { selectable: true },
                { field: "cargoCode", title: "货物编码", width: 120 },
                { field: "originalName", title: "货物内部名称", width: 120 },
                { field: "rawMaterialName", title: "所属原料", width: 120 },
                { field: "barCode", title: "货物条码", width: 120 },
                { field: "selfBarCode", title: "自定义条码", width: 120 },
                { field: "effectiveTime", title: "保质期(天)", width: 120 },
                { title: "规格", width: 120, template: '#: number #/#: measurementCode #' },
                { field: "standardUnitCode", title: "最小标准单位", width: 120 },
                { field: "createTime", title: "建档时间", width: 120 },
                { field: "memo", title: "备注", width: 200 }
            ]
        }
    };

    // 已选中货物列表
    $scope.currentCargoList = {
        primaryId: 'cargoCode',
        persistSelection: true,
        kendoSetting: {
            columns: [
                { title: "操作", locked: true, command: [{ name: 'del', text: "删除", click: deleteCurrentCargo }], width: 80 },
                { field: "cargoCode", title: "货物编码", width: 120 },
                { field: "originalName", title: "货物内部名称", width: 120 },
                { field: "rawMaterialName", title: "所属原料", width: 120 },
                { field: "barCode", title: "货物条码", width: 120 },
                { field: "selfBarCode", title: "自定义条码", width: 120 },
                { field: "effectiveTime", title: "保质期(天)", width: 120 },
                { title: "规格", width: 120, template: '#: number #/#: measurementCode #' },
                { field: "standardUnitCode", title: "最小标准单位", width: 120 },
                { field: "createTime", title: "建档时间", width: 120 },
                { field: "memo", title: "备注", width: 200 }
            ]
        }
    };

    // 删除选中的单条货物
    function deleteCurrentCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        var dataSource = $scope.currentCargoList.kendoGrid.dataSource;
        _.find(dataSource.data(), function (item, index) {
            if (item.cargoCode === dataItem.cargoCode) {
                dataSource.remove(dataSource.at(index));
                return true;
            }
            return false;
        });
    }

    // 增加货物
    $scope.addCargo = function () {
        var selectIds = $scope.cargoList.kendoGrid.selectedKeyNames();
        var dataSource = $scope.cargoList.kendoGrid.dataSource;
        var currentDataSource = $scope.currentCargoList.kendoGrid.dataSource;
        _.each(dataSource.data(), function (item, index) {
            if (_.indexOf(selectIds, '' + item.cargoCode) > -1) {
                currentDataSource.add(item);
            }
        });
    };

    /**
     * 提交选中货物
     */
    $scope.submit = function () {
        var result = _.map($scope.currentCargoList.kendoGrid.dataSource.data(), function (item) {
            return {
                barCode: item.barCode,
                cargoCode: item.cargoCode,
                cargoId: item.cargoId,
                cargoName: item.cargoName,
                cargoType: item.cargoType,
                createTime: item.createTime,
                effectiveTime: item.effectiveTime,
                logicStatus: item.logicStatus,
                measurementCode: item.measurementCode,
                memo: item.memo,
                number: item.number,
                originalName: item.originalName,
                rawMaterialId: item.rawMaterialId,
                rawMaterialName: item.rawMaterialName,
                selfBarCode: item.selfBarCode,
                standardUnitCode: item.standardUnitCode,
                updateTime: item.updateTime
            };
        });
        cb(result);
        $scope.$close();
    };
});