'use strict';

angular.module('app').controller('selfPickCtrl', function ($scope, $uibModal) {
    $scope.params = {};
    $scope.tmp = 0;

    $scope.outType = [
        // {key: '1', value: '1', text: '正常库'},
        {key: '2', value: '2', text: '仓储库'},
        {key: '3', value: '3', text: '进货库'},
        {key: '4', value: '4', text: '退货库'},
        {key: '5', value: '5', text: '在途库'},
        {key: '6', value: '6', text: '预留库'}
    ];

    $scope.CargoListGrid = {
        primaryId: 'code',
        kendoSetting: {
            autoBind: false,
            persistSelection: true,
            editable: true,
            // pageable: true,
            columns: [
                {selectable: true},
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "cargoNumber", title: "货物数量"}, // 对应添加货物的实拣数量
                {field: "standardNumber", title: "标准单位数量"},
                {field: "standardUnit", title: "标准单位"},
                {field: "remarks", title: "备注"}
            ]
        }
    };

    $scope.outStationParams = {
        // single: true,
        callback: function (data) {
            console.log(data);
        }
    };

    $scope.addData = function () {
        var dataSource = $scope.CargoListGrid.kendoGrid.dataSource;
        dataSource.add({
            code: $scope.tmp,
            cargoName: '咖啡豆',
            cargoCode: 'hw00' + $scope.tmp.toString(),
            rawMaterialId: '咖啡豆',
            cargoNum: 20,
            standardNum: '500g/包',
            standardUnit: 20,
            remarks: '备注'
        });
        $scope.tmp++;
    };

    $scope.deleteData = function () {
        var selectId = $scope.CargoListGrid.kendoGrid.selectedKeyNames();
        var dataSource = $scope.CargoListGrid.kendoGrid.dataSource;
        for (var j in selectId) {
            for (var i = 0; i < dataSource._total; i++) {
                if (dataSource.at(i).code.toString() === selectId[j]) {
                    dataSource.remove(dataSource.at(i));
                }
            }
        }
    };

    // 数据监控，警告库位修改
    $scope.$watch('params.outStationType', function (newVal, oldVal) {
        if (oldVal === undefined || newVal === '1') {
            $scope.params.outStationType = '1'
        } else {
            swal({
                title: '已将出库库位修改为' + $scope.outType[parseInt(newVal) - 2].text,
                type: 'warning',
                // showCancelButton: true,
                confirmButtonText: '是的'
            }).then(function (res) {
                if (res.value) {
                    // alert($scope.params.outStationType)
                } else if (res.dismiss === 'cancel') {
                    // 未实现
                }
            })
        }
    });

    // 保存出库单
    $scope.save = function () {

    };

    // 提交出库单
    $scope.submit = function () {

    };

    // 重置选项
    $scope.reset = function () {
        $scope.params = {}
    };

    // 添加货物
    $scope.addCargo = function () {
        var dataSource = $scope.CargoListGrid.kendoGrid.dataSource;
        editCargoList(dataSource)
    };

    function editCargoList(data) {
        initCargoEdit(data)
    }

    function initCargoEdit(data) {
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/pickAdd.html',
            scope: $scope,
            size: 'lg',
            controller: 'ModalPickAddCtrl'
        });
    }

});