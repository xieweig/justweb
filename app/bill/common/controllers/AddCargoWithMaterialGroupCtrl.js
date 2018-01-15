'use strict';

angular.module('app').controller('AddCargoWithMaterialGroupCtrl', function ($scope, $timeout, cb, data) {
    $scope.params = {};
    $scope.show = data.hasOwnProperty('m');

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
                {selectable: true},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "originalName", title: "货物内部名称", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {field: "barCode", title: "货物条码", width: 120},
                {field: "selfBarCode", title: "自定义条码", width: 120},
                {field: "effectiveTime", title: "保质期(天)", width: 120},
                {title: "规格", width: 120, template: '#: number #/#: measurementCode #'},
                {field: "standardUnitCode", title: "最小标准单位", width: 120},
                {field: "createTime", title: "建档时间", width: 120},
                {field: "memo", title: "备注", width: 200}
            ]
        }
    };

    // 已选中货物列表
    $scope.currentCargoList = {
        primaryId: 'cargoCode',
        persistSelection: true,
        kendoSetting: {
            editable: true,
            columns: [
                {title: "操作", locked: true, command: [{name: 'select', text: "删除", click: delCurCargo}], width: 80},
                {field: "cargoName", title: "货物名称", width: 120},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {field: "standardUnitCode", title: "标准单位", width: 120},
                {title: "规格", width: 120, template: '#: number #/#: measurementCode #'},
                {field: "actualAmount", title: "货物数量", width: 120, editable: true}
            ]
        }
    };

    // 当前原料列表
    $scope.currentMaterialGrid = {
        primaryId: 'code',
        kendoSetting: {
            columns: [
                {field: "materialName", title: "原料名称"},
                {field: "materialCode", title: "原料编码"},
                {field: "shippedAmount", title: "应拣数量"},
                {field: "actualAmount", title: "实拣数量"},
                {field: "progress", title: "完成度"}
            ]
        }
    };

    // 同步已选中数据
    $timeout(function () {
        _.each(data.cl, function (item) {
            console.log('+++++', item)
            $scope.currentCargoList.kendoGrid.dataSource.add(item)
        })
        _.each(data.m, function (item) {
            $scope.currentMaterialGrid.kendoGrid.dataSource.add(item)
        })
    }, 100);

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
                rawMaterialCode: item.rawMaterialCode,
                rawMaterialName: item.rawMaterialName,
                selfBarCode: item.selfBarCode,
                standardUnitCode: item.standardUnitCode,
                updateTime: item.updateTime,
                actualAmount: item.actualAmount
            };
        });
        cb(result);
    };

    // 删除当前货物
    function delCurCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.currentCargoList.kendoGrid.dataSource.remove(dataItem)
    }
});