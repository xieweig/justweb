'use strict';

angular.module('app').controller('selfPickCtrl', function ($scope, $state, $rootScope, $uibModal, $timeout, ApiService, Common, cargoUnit, materialUnit) {
    $scope.params = {};
    $scope.cargoConfigure = cargoUnit;
    $scope.materialConfigure = materialUnit;

    $scope.cargoList = {};
    $scope.outType = [];
    // 获取当前站点
    Common.getStore().then(function (storage) {
        $scope.storage = storage;
        _.each(storage, function (item) {
            $scope.outType.push({
                key: item.tempStorageCode,
                value: item.tempStorageCode,
                text: item.tempStorageName,
                type: item.storageType
            })
        });
        // 设置当前站点默认值
        $timeout(function () {
            $('#select-out').val($scope.outType[0].value).trigger('change')
        })
    })

    $scope.bill = {
        billProperty: 'NOPLAN',
        basicEnum: 'BY_CARGO',
        billCode: '',
        fromBillCode: '',
        planMemo: '',
        outMemo: '',
        operatorCode: ''
    };

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
                {field: "number", title: "标准单位数量"},
                {field: "standardUnitCode", title: "标准单位", template: function (data) {
                        return getTextByVal($scope.materialConfigure, data.standardUnitCode);
                    }},
                {field: "memo", title: "备注"}
            ]
        }
    };

    $scope.inStationParams = {
        single: true,
        callback: function (data) {
            $scope.params.inStationCode = data
        }
    };

    // 数据监控，警告库位修改
    $scope.$watch('params.outStationType', function (newVal, oldVal) {
        var isChange = true;
        var storageName = '';
        _.each($scope.storage, function (item) {
            // TODO: 后端数据拼错，应为 NORMAL
            if(item.tempStorageCode === newVal && item.storageType === 'NORMAL'){
                isChange = false;
                storageName = item.tempStorageName
            }
        })
        if (!isChange || oldVal === undefined) {
            // $scope.params.outStationType = $scope.outType[0].value
        } else {
            swal({
                title: '已将出库库位修改为' + storageName,
                type: 'warning',
                confirmButtonText: '是的',
                showCancelButton: true
            }).then(function (res) {
                if (res.value) {
                } else if (res.dismiss === 'cancel') {
                    // 重置选项为初始
                    $('#select-out').val($scope.outType[0].value).trigger('change')
                }
            })
        }
    });

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
            url = '/api/bill/restock/saveRestockBillBySelf'
        } else {
            url = '/api/bill/restock/submitRestockBillBySelf'
        }
        bill.basicEnum = 'BY_CARGO';
        bill.planMemo = $scope.params.memo;
        // bill.operatorCode = $.cookie('userCode');
        bill.totalPrice = '12345';
        bill.billProperty = 'NOPLAN';
        // 获取当前库位
        bill.outStation = {
            stationCode: $.cookie('currentStationCode'),
            stationName: '',
            stationType: $.cookie('STORE'),
            storage: {
                storageCode: $scope.params.outStationType,
                storageName: ''
            }
        };
        // 获取选择站点的在途库
        var inStationCode = $scope.params.inStationCode.stationCode;
        var tmpStorageCode = '';
        Common.getStore(inStationCode).then(function (storageList) {
            var jump = true;
            _.each(storageList, function (item) {
                // 取第一个在途库
                if (jump && item.storageType === 'PASSAGELIBRARY') { // 数据的Type没加 所以站点没了
                    tmpStorageCode = item.tempStorageCode;
                    jump = false
                }
            })
        });
        bill.inStation = {
            stationCode: inStationCode,
            stationName: '',
            stationType: 'LOGISTICS',
            storage: {
                storageCode: tmpStorageCode,
                storageName: ''
            }
        };
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
                $state.go('app.bill.restock.outSearch');
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
});