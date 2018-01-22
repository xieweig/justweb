'use strict';

angular.module('app').controller('ReturnedPickBySelfCtrl', function ($scope, $state, $rootScope, $uibModal, $timeout, ApiService, Common, cargoUnit, materialUnit) {
    $scope.params = {};
    $scope.cargoConfigure = cargoUnit;
    $scope.materialConfigure = materialUnit;

    $scope.storageType = [
        {value: 'NORMAL', text: '正常库'},
        {value: 'STORAGE', text: '仓储库'},
        {value: 'IN_STORAGE', text: '进货库'},
        {value: 'OUT_STORAGE', text: '退货库'},
        {value: 'ON_STORAGE', text: '在途库'},
        {value: 'RESERVE_STORAGE', text: '预留库'}
    ];
    $timeout(function () {
        $('#select-out').val($scope.storageType[1].value).trigger('change');
    });
    // $scope.cargoList = {};
    // 设置当前站点默认值
    $scope.CargoListGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            autoBind: false,
            persistSelection: true,
            editable: true,
            pageable: true,
            columns: [
                {selectable: true},
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialName", title: "所属原料"},
                {field: "actualAmount", title: "货物数量"}, // 对应添加货物的实拣数量
                {
                    title: "货物规格", template: function (data) {
                        return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                    }
                },
                {field: "number", title: "标准单位数量"},
                {
                    field: "standardUnitCode", title: "标准单位", template: function (data) {
                        return getTextByVal($scope.materialConfigure, data.standardUnitCode);
                    }
                },
                {field: "memo", title: "备注"}
            ]
        }
    };

    $scope.supplierParams = {
        single: true,
        type: 'supplier',
        callback: function (data) {
            $scope.params.supplier = data
        }
    };

// 数据监控，警告库位修改
    $scope.$watch('params.outStorageType', function (newVal, oldVal) {

        if (newVal === 'NORMAL' || oldVal === undefined) {
        }else {
            swal({
                title: '是否将出库库位修改为' + getTextByVal($scope.storageType, newVal),
                type: 'warning',
                confirmButtonText: '是的',
                showCancelButton: true
            }).then(function (res) {
                if (res.value) {
                } else if (res.dismiss === 'cancel') {
                    // 重置选项为初始
                    $('#select-out').val($scope.storageType[0].value).trigger('change')
                }
            })
        }
    });

    $scope.bill = {
        billType: 'RETURNED',
        specificBillType: 'NO_PLAN',
        basicEnum: 'BY_CARGO',
        billPurpose: 'OUT_STORAGE'
    };

// 保存出库单
    $scope.save = function () {
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
            url = '/api/bill/returned/saveBySelf'
        } else {
            url = '/api/bill/returned/submitBySelf'
        }
        bill.outStorageMemo = $scope.params.outStorageMemo;
        bill.totalAmount = 1;
        bill.totalVarietyAmount = 1;
        // 获取当前库位
        bill.outLocation = {
            stationCode: $.cookie('currentStationCode'),
            stationName: $.cookie('currentStationName'),
            // stationType: $.cookie('STORE'),
            storage: {
                storageCode: $scope.params.outStorageType,
                storageName: getTextByVal($scope.storageType, $scope.params.outStorageType)
            }
        };
        // 获取选择站点的在途库
        // bill.inLocation = {
        //     stationCode: $scope.params.inStationCode.stationCode,
        //     stationName: getTextByVal($scope.station, $scope.params.inStationCode.stationCode),
        //     stationType: 'LOGISTICS',
        //     storage: {
        //         storageCode: 'ON_STORAGE',
        //         storageName: getTextByVal($scope.storageType, 'ON_STORAGE')
        //     }
        // };
        bill.supplier = {
            supplierCode: $scope.params.supplier.supplierCode
        }

        bill.billDetails = _.map($scope.CargoListGrid.kendoGrid.dataSource.data(), function (item) {
            return {
                rawMaterial: {
                    rawMaterialCode: item.rawMaterialCode,
                    rawMaterialName: item.rawMaterialName,
                    cargo: {
                        cargoCode: item.cargoCode,
                        cargoName: item.cargoName
                    }
                },
                actualAmount: item.actualAmount,
                shippedAmount: item.actualAmount // 站点自己拣货,实拣和应拣一致
            }
        });
        ApiService.post(url, bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                $state.go('app.bill.returned.outSearch');
            }
        }, apiServiceError)
    }


// 重置选项
    $scope.reset = function () {
        $state.reload($state.current.name)
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
                        $scope.cargoList = data;
                        var dataSource = $scope.CargoListGrid.kendoGrid.dataSource;
                        dataSource.data([]);
                        for (var i = 0; i < data.length; i++) {
                            dataSource.add(data[i])
                        }
                        $scope.addModal.close()
                    }
                },
                data: {
                    cl: $scope.CargoListGrid.kendoGrid.dataSource.data(),
                    cargoUnit: $scope.cargoConfigure,
                    materialUnit: $scope.materialConfigure
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

})
;