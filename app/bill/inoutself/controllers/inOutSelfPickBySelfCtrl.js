'use strict';

angular.module('app').controller('inOutSelfPickBySelfCtrl', function ($scope, $state, $uibModal, $timeout, ApiService, Common, cargoUnit, materialUnit) {
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
        $('#select-out').val($scope.storageType[2].value).trigger('change');
    });

    $scope.cargoList = {};

    $scope.cargoListGrid = {
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
                {field: "actualAmount", title: "货物数量"},
                {
                    title: "货物规格", template: function (data) {
                        return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                    }
                },
                {
                    title: "标准单位数量", template: function (data) {
                        return data.number * data.actualAmount
                    }
                },
                {
                    field: "standardUnitCode", title: "标准单位", template: function (data) {
                        return getTextByVal($scope.materialConfigure, data.standardUnitCode);
                    }
                },
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

    $scope.bill = {
        billType: 'IN_OUT_SELF',
        specificBillType: 'IN_OUT_SELF',
        sourceBillType: 'NO_PLAN',
        basicEnum: 'BY_CARGO',
        billPurpose: 'OUT_STORAGE'
    };

    // 保存出库单
    $scope.save = function () {
        saveOrSubmit('save', _.cloneDeep($scope.bill))
    };

    // 提交出库单
    $scope.submit = function () {
        saveOrSubmit('submit', _.cloneDeep($scope.bill))
    };

    // 保存和提交合并
    function saveOrSubmit(type, bill) {
        var flag = true; // 货物数据是否正确的标志
        if (!$scope.params.inStationCode) {
            swal('参数错误', '调入站点不能为空', 'error');
            return
        }

        var url = '';
        if (type === 'save') {
            url = '/api/bill/inOutSelf/saveBySelf'
        } else {
            url = '/api/bill/inOutSelf/submitBySelf'
        }
        bill.outStorageMemo = $scope.params.outStorageMemo;
        bill.totalAmount = 1;
        bill.totalVarietyAmount = 1;
        bill.outLocation = {
            stationCode: $.cookie('currentStationCode'),
            stationName: $.cookie('currentStationName'),
            // stationType: $.cookie('STORE'),
            storage: {
                storageCode: $scope.params.outStorageType,
                storageName: getTextByVal($scope.storageType, $scope.params.outStorageType)
            }
        };
        bill.inLocation = {
            stationCode: $scope.params.inStationCode.stationCode,
            stationName: getTextByVal($scope.station, $scope.params.inStationCode.stationCode),
            // stationType: 'LOGISTICS',
            storage: {
                storageCode: 'ON_STORAGE',
                storageName: getTextByVal($scope.storageType, 'ON_STORAGE')
            }
        };
        bill.billDetails = _.map($scope.cargoListGrid.kendoGrid.dataSource.data(), function (item) {
            if (!checkNumber(item.actualAmount)) {
                swal('参数错误', '货物数量错误', 'error');
                flag = false;
                return
            }
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
                shippedAmount: 0
            }
        });
        if (!flag) {
            return
        }
        ApiService.post(url, bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功!', '', 'success').then(function () {
                    $state.go('app.bill.inoutself.outStorageList');
                })
            }
        }, apiServiceError)
    }


    // 重置选项
    $scope.reset = function () {
        $state.reload($state.current.name)
    };

    // 添加货物
    $scope.addCargo = function () {
        var dataSource = $scope.cargoListGrid.kendoGrid.dataSource;
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
                        var dataSource = $scope.cargoListGrid.kendoGrid.dataSource;
                        dataSource.data([]);
                        for (var i = 0; i < data.length; i++) {
                            dataSource.add(data[i])
                        }
                        $scope.addModal.close()
                    }
                },
                data: {
                    cl: $scope.cargoListGrid.kendoGrid.dataSource.data(),
                    cargoUnit: $scope.cargoConfigure,
                    materialUnit: $scope.materialConfigure
                },
                form: function () {
                    return _.map($scope.cargoListGrid.kendoGrid.dataSource.data(), function (item) {
                        return combinationItem(item);
                    })
                }
            }
        });
    }

    function combinationItem(item) {
        return {
            "createTime": item.createTime,
            "updateTime": item.updateTime,
            "cargoId": item.cargoId,
            "cargoCode": item.cargoCode,
            "barCode": item.barCode,
            "selfBarCode": item.selfBarCode,
            "originalName": item.originalName,
            "cargoName": item.cargoName,
            "effectiveTime": item.effectiveTime,
            "measurementCode": item.measurementCode,
            "standardUnitCode": item.standardUnitCode,
            "memo": item.memo,
            "number": item.number,
            "rawMaterialId": item.rawMaterialId,
            "operatorCode": item.operatorCode,
            "cargoType": item.cargoType,
            "rawMaterialName": item.rawMaterialName,
            "rawMaterialCode": item.rawMaterialCode,
            "configureName": item.configureName,
            "dateInProduced": item.dateInProduced,
            "unitPrice": item.unitPrice,
            "actualAmount": item.actualAmount,
            "shippedAmount": item.shippedAmount,
        };
    }

    $scope.delCargo = function () {
        var grid = $scope.cargoListGrid.kendoGrid;
        var selectId = grid.selectedKeyNames();
        var dataSource = grid.dataSource;
        for (var j in selectId) {
            for (var i = 0; i < dataSource._total; i++) {
                if (dataSource.at(i).cargoCode.toString() === selectId[j]) {
                    dataSource.remove(dataSource.at(i));
                }
            }
        }
        grid._selectedIds = {};
        grid.clearSelection();
        if (selectId.length !== 0) {
            swal('删除成功', '', 'success')
        } else {
            swal('请选择要批量删除的货物', '', 'warning')
        }
        grid.refresh();
    };
});
