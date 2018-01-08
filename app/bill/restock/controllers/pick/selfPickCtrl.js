'use strict';

angular.module('app').controller('selfPickCtrl', function ($scope, $rootScope, $uibModal, $timeout, ApiService, Common) {
    $scope.params = {};
    $scope.cargoList = {};
    $scope.outType = []
    // 获取当前站点
    Common.getStore().then(function (storage) {
        $scope.storage = storage
        _.each(storage, function (item) {
            $scope.outType.push({
                key: item.tempStorageCode,
                value: item.tempStorageCode,
                text: item.tempStorageName
            })
        })
        // 设置默认值
        $timeout(function () {
            $('#select-out').val($scope.outType[0].value).trigger('change')
        })
    })

    $scope.bill = {
        billProperty: 'NOPLAN',
        basicEnum: 'BY_CARGO',
        billCode: null,
        fromBillCode: null,
        planMemo: '',
        outMemo: '',
        operatorCode: ''
    }

    // $scope.outType = [
    //     // {key: '1', value: '1', text: '正常库'},
    //     {key: '2', value: '2', text: '仓储库'},
    //     {key: '3', value: '3', text: '进货库'},
    //     {key: '4', value: '4', text: '退货库'},
    //     {key: '5', value: '5', text: '在途库'},
    //     {key: '6', value: '6', text: '预留库'}
    // ];

    $scope.CargoListGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            autoBind: false,
            persistSelection: true,
            editable: true,
            // pageable: true,
            columns: [
                {selectable: true},
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialName", title: "所属原料"},
                {field: "cargoNumber", title: "货物数量"}, // 对应添加货物的实拣数量
                {field: "number", title: "标准单位数量"},
                {field: "standardUnitCode", title: "标准单位"},
                {field: "memo", title: "备注"}
            ]
        }
    };

    $scope.inStationParams = {
        // single: true,
        callback: function (data) {
            console.log(data);
        }
    };

    // 数据监控，警告库位修改
    $scope.$watch('params.outStationType', function (newVal, oldVal) {
        if (oldVal === undefined || newVal === '1') {
            // $scope.params.outStationType = $scope.outType[0].value
        } else {
            console.log('---', newVal, oldVal)
            swal({
                title: '已将出库库位修改',
                type: 'warning',
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
        console.log($scope.CargoListGrid.kendoGrid.dataSource.data())
        console.log($scope.params.memo)
        saveOrAudit('save', _.cloneDeep($scope.bill))
    };

    // 提交出库单
    $scope.submit = function () {
        saveOrAudit('submit', _.cloneDeep($scope.bill))
    };

    // 保存和提交合并
    function saveOrAudit(type, bill) {
        var url = '';
        if (type === 'save') {
            url = '/api/bill/restock/saveRestockBill'
        } else {
            url = '/api/bill/restock/submitRestockBill'
        }
        bill.planMemo = $scope.params.memo
        bill.operatorCode = $.cookie('userCode')
        bill.totalPrice = '12345'
        // station没调试
        bill.outStation = {
            stationCode: 'HDQA00',
            stationName: $.cookie('currentStationName'),
            stationType: $.cookie('STORE'),
            storage: {
                storageCode: $scope.storage[0].tempStorageCode,
                storageName: $scope.storage[0].tempStorageName
            }
        }
        bill.inStation = {
            stationCode: 'HDQA00',
            stationName: $.cookie('currentStationName'),
            stationType: 'LOGISTICS',
            storage: {
                storageCode: $scope.storage[0].tempStorageCode,
                storageName: $scope.storage[0].tempStorageName
            }
        }
        bill.billDetails = _.map($scope.CargoListGrid.kendoGrid.dataSource.data(), function (item) {
            return {
                rawMaterial: {
                    rawMaterialCode: item.rawMaterialId,
                    rawMaterialName: item.rawMaterialName,
                    cargo: {
                        cargoCode: item.cargoCode,
                        cargoName: item.cargoName
                    }
                },
                actualAmount: null,
                shippedAmount: '1'
            }
        })
        ApiService.post(url, bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                alert('success')
                // $state.go('app.bill.procurement.list');
            }
        }, apiServiceError)
    }


    // 重置选项
    $scope.reset = function () {
        $scope.params = {
            outStationType: '1'
        };
        $scope.CargoListGrid.kendoGrid.dataSource.data([]);
        $timeout(function () {
            $('#select-out').val('1').trigger('change')
        }, 100)
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
            templateUrl: 'app/bill/common/modals/addCargoWithMaterial.html',
            size: 'lg',
            controller: 'AddCargoWithMaterialCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        console.log(data)
                        $scope.cargoList = data;
                        var dataSource = $scope.CargoListGrid.kendoGrid.dataSource;
                        dataSource.data([])
                        for (var i = 0; i < data.length; i++) {
                            dataSource.add(data[i])
                        }
                        $scope.addModal.close()
                    }
                },
                data: {
                    cl: $scope.CargoListGrid.kendoGrid.dataSource.data()
                }
            }
        });
    }

    $scope.delCargo = function () {
        var selectId = $scope.CargoListGrid.kendoGrid.selectedKeyNames();
        var dataSource = $scope.CargoListGrid.kendoGrid.dataSource;
        for (var j in selectId) {
            for (var i = 0; i < dataSource._total; i++) {
                if (dataSource.at(i).cargoCode.toString() === selectId[j]) {
                    dataSource.remove(dataSource.at(i));
                }
            }
        }
    };

});