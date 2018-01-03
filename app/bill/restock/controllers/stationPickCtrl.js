'use strict';

angular.module('app').controller('stationPickCtrl', function ($scope, $state, $stateParams, $uibModal, $timeout, ApiService) {
    $scope.params = {};

    // 获取计划单信息
    ApiService.get('http://localhost:5000/api/bill/restock/findPlanOne?id=' + $stateParams.pickId, {hasHost: true}).then(function (response) {
        if (response.code === '000') {
            var res = response.result.content[0];
            $scope.params.billCode = res.billCode
            $scope.params.memo = res.remarks
            $scope.params.recordTime = res.recordTime
            $scope.params.outStationName = res.outStationName
            $scope.params.inStationName = res.inStationName
            $scope.params.type = res.type

            if (res.type === 'material') {
                // 按原料拣货，不要要考虑货物
                $('#tabs').children('li:eq(1)').children('a').click()
            } else {
                // 按货物拣货，需要考虑原料
                var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
                for (var i in res.cargoList) {
                    dataSource.add({
                        cargoName: res.cargoList[i].cargoName,
                        cargoCode: res.cargoList[i].cargoCode,
                        rawMaterialId: res.cargoList[i].rawMaterialId,
                        number: res.cargoList[i].number,
                        pickNumber: res.cargoList[i].pickNumber
                    })
                }
            }
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError)

    $scope.cargoGrid = {
        primaryId: 'cg',
        kendoSetting: {
            // autoBind: false,
            // pageable: true,
            editable: true,
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "number", title: "规格"},
                {field: "pickNumber", title: "应拣数量"},
                {field: "realNumber", title: "实拣数量"},
                {field: "remarks", title: "备注", editable: true}
            ]
        }
    };

    $scope.outStationParams = {
        single: true,
        callback: function (data) {
            $scope.params.inStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    $scope.inStationParams = {
        single: true,
        callback: function (data) {
            $scope.params.outStationCode = _.map(data, function (item) {
                return item.stationCode;
            });
        }
    };

    // $timeout(function () {
    //     var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
    //     dataSource.add({
    //         cargoName: '咖啡豆',
    //         cargoCode: 'hw001',
    //         rawMaterialId: '咖啡豆',
    //         number: '500g/包',
    //         pickNumber: '20',
    //         realNumber: '0',
    //         remarks: ''
    //     });
    //     dataSource.add({
    //         cargoName: '伊利纯牛奶',
    //         cargoCode: 'hw002',
    //         rawMaterialId: '牛奶',
    //         number: '1000毫升/包',
    //         pickNumber: '15',
    //         realNumber: '0',
    //         remarks: ''
    //     })
    // }, 500);

    // 测试回车监听
    $scope.sendCode = function ($event) {
        if ($event.charCode === 13) {
            // alert('key down')
            initScanCargo()
        }
    };

    function initScanCargo() {
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/scan.html',
            scope: $scope,
            size: 'xs',
            controller: 'ModalScanCtrl'
        });
    }

    // 按原料拣货
    $scope.itemMap = [];

    //ApiService
    $scope.addItem = function () {
        var item = {
            unfurled: true,
            material: {
                materialName: '咖啡豆',
                materialNumber: '10000g',
                progress: '0%'
            },
            cargoGrid: {
                primaryId: 'cargoCode',
                kendoSetting: {
                    columns: [
                        {field: "cargoNmae", title: "货物名称"},
                        {field: "cargoCode", title: "货物编码"},
                        {field: "rawMaterialId", title: "所属原料"},
                        {field: "number", title: "规格"},
                        {field: "realNumber", title: "实拣数量"},
                        {field: "remarks", title: "备注"},
                        {command: [{name: 'delete', text: "删除", click: delCargo}], title: "操作"}
                    ]
                }
            }
        };
        $scope.itemMap.push(item);
    };

    $scope.addItem();
    $scope.addItem();

    // 伸缩项
    $scope.scaling = function (index) {
        $scope.itemMap[index].unfurled = !$scope.itemMap[index].unfurled;
    };

    $scope.addCargo = function (index) {
        // var dataSource = $scope.itemMap[index].cargoGrid.kendoGrid.dataSource;
        $scope.index = index;
        initCargoEdit()
    };

    function initCargoEdit() {
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/restock/modals/addCargoByMaterial.html',
            scope: $scope,
            size: 'lg',
            controller: 'ModalAddCargoByMaterialCtrl'
        });
    }

    function delCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        console.log(dataItem)
        // $scope.itemMap[index].cargoGrid.kendoGrid.dataSource.remove(dataItem)
    }

    // save
    $scope.save = function () {
        getActiveVal()
    }

    $scope.submit = function () {

    }

    function getActiveVal() {
        if ($('#tabs').children('li:first-child').hasClass('active')) {
            alert(1)
        }
        else {
            alert(2)
        }
    }

    //TODO: 按货物拣货 输入数字验证
});