'use strict';

angular.module('app').controller('ReturnedPickByPlanModalCtrl', function ($scope, $state, $stateParams, $uibModal, $timeout, ApiService, Common, data) {
    $scope.params = {};
    $scope.cargoConfigure = data.cargoUnit;
    $scope.materialConfigure = data.materialUnit;

    // 存储按货物拣货的对象，用于判断扫描的货物是否属于本次拣货
    $scope.cargoObject = {};
    // $scope.outType = [];

    $scope.storageType = [
        {value: 'NORMAL', text: '正常库'},
        {value: 'STORAGE', text: '仓储库'},
        {value: 'IN_STORAGE', text: '进货库'},
        {value: 'OUT_STORAGE', text: '退货库'},
        {value: 'ON_STORAGE', text: '在途库'},
        {value: 'RESERVE_STORAGE', text: '预留库'}
    ];
    $scope.outType = $scope.storageType;
    $timeout(function () {
        $('#select-out').val($scope.storageType[0].value).trigger('change');
    });
    // Common.getStore().then(function (storage) {
    //     _.each(storage, function (item) {
    //         $scope.outType.push({
    //             key: item.tempStorageCode,
    //             value: item.tempStorageCode,
    //             text: item.tempStorageName
    //         })
    //     });
    //     // 设置默认值
    //     $timeout(function () {
    //         $('#select-out').val($scope.outType[0].value).trigger('change')
    //     })
    // });

    // 屏蔽按原料拣货时触发的操作
    $scope.change = function () {
    };

    ApiService.get('/api/bill/returned/findPlanByBillCode?billCode=' + data.billCode).then(function (response) {
        if (response.code === '000') {
            var res = response.result.bill;
            // 赋值到scope上
            _.each(['basicEnum', 'billCode', 'memo', 'createTime', 'updateTime', 'rootCode', 'outStorageMemo'], function (name) {
                $scope.params[name] = res[name]
            });
            $scope.params.outStationCode = res.outStationCode;
            $scope.params.inStationCode = res.inStationCode;
            $scope.params.outStationName = getTextByVal($scope.station, res.outStationCode);
            // $scope.params.inStationName = getTextByVal($scope.station, res.inStationCode);
            $scope.params.supplier = {};
            $scope.params.supplier.supplierCode = res.inStationCode;

            Common.getSupplierByIds([$scope.params.supplier.supplierCode]).then(function (supplierList) {
                var supplierObj = _.zipObject(_.map(supplierList, function (item) {
                    return item.supplierCode;
                }), supplierList);
                $scope.params.supplier.supplierName = supplierObj[$scope.params.supplier.supplierCode].supplierName;
            });

            if (res.basicEnum === 'BY_CARGO') {
                // 按货物拣货
                $timeout(function () {
                    var billDetails = res.childPlanBillDetails;
                    var cargoCodeList = _.map(billDetails, function (item) {
                        return item.rawMaterial.cargo.cargoCode
                    });
                    // 获取货物信息
                    Common.getCargoByCodes(cargoCodeList).then(function (cargoList) {
                        var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                            return item.cargoCode
                        }), cargoList);
                        $scope.cargoObject = cargoObject;
                        var materialCodeList = [];
                        _.each(billDetails, function (item) {
                            // 添加货物信息
                            item.cargo = cargoObject[item.rawMaterial.cargo.cargoCode];
                            materialCodeList.push(item.rawMaterial.rawMaterialCode)
                        });

                        // 获取原料信息
                        Common.getMaterialByCodes(materialCodeList).then(function (materialList) {
                            var materialObject = _.zipObject(_.map(materialList, function (item) {
                                return item.materialCode
                            }), materialList);
                            _.each(billDetails, function (item) {
                                // 添加原料信息
                                item.material = materialObject[item.rawMaterial.rawMaterialCode];
                                $scope.cargoGrid.kendoGrid.dataSource.add({
                                    cargoName: item.cargo.cargoName,
                                    cargoCode: item.cargo.cargoCode,
                                    rawMaterialName: item.material.materialName,
                                    rawMaterialCode: item.material.materialCode,
                                    number: item.cargo.number,
                                    standardUnitCode: item.cargo.standardUnitCode,
                                    actualAmount: 0,
                                    shippedAmount: item.amount
                                })
                            })
                        })
                    })
                });

                $scope.change = function (e) {
                    swal({
                        title: '提示',
                        text: '你将要从货物操作切换到原料操作，切换后之前的数据将被清空，请问是否确定切换？',
                        type: 'warning',
                        showCancelButton: true
                    }).then(function (result) {
                        if (result.value) {
                            var tabBtn = $('#tabs').children('li:first-child').children('a');
                            // 置为不可点击
                            tabBtn.attr('data-toggle', null);
                            tabBtn.click(function (e) {
                                e.preventDefault()
                            });
                            // 屏蔽掉原change函数,只能改变一次
                            $scope.change = function () {
                            };
                            // 计算原来各种原料的需求，再addItem
                            var materialResult = {};
                            _.each(res.childPlanBillDetails, function (item) {
                                if (!materialResult[item.material.materialCode]) {
                                    materialResult[item.material.materialCode] = {
                                        shippedAmount: 0
                                    }
                                }
                                materialResult[item.material.materialCode].rawMaterialCode = item.material.materialCode;
                                materialResult[item.material.materialCode].materialName = item.material.materialName;
                                materialResult[item.material.materialCode].shippedAmount += parseInt(item.amount) * parseInt(item.cargo.number)
                            });
                            _.each(materialResult, function (item) {
                                $scope.addItem({
                                    materialName: item.materialName,
                                    rawMaterialCode: item.rawMaterialCode,
                                    shippedAmount: item.shippedAmount
                                })
                            })
                        } else {
                            $('#tabs').children('li:first-child').children('a').click()
                        }
                    })
                }
            } else {
                // 按原料拣货
                $timeout(function () {
                    $('#tabs').children('li:eq(1)').children('a').click();
                    var materialCodeList = _.map(res.childPlanBillDetails, function (item) {
                        return item.rawMaterial.rawMaterialCode
                    });
                    Common.getMaterialByCodes(materialCodeList).then(function (materialList) {
                        var materialObject = _.zipObject(_.map(materialList, function (item) {
                            return item.materialCode
                        }), materialList);
                        _.each(res.childPlanBillDetails, function (item) {
                            $scope.addItem({
                                materialName: materialObject[item.rawMaterial.rawMaterialCode].materialName,
                                rawMaterialCode: item.rawMaterial.rawMaterialCode,
                                shippedAmount: item.amount
                            })
                        })
                    })
                })
            }
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError);

    /**
     * 按货物拣货
     **/
    $scope.cargoGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            editable: true,
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialName", title: "所属原料"},
                {
                    title: "规格", template: function (data) {
                        return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                    }
                },
                {field: "shippedAmount", title: "应拣数量"},
                {field: "actualAmount", title: "实拣数量"},
                {field: "memo", title: "备注", editable: true}
            ]
        }
    };

    // 测试回车监听
    $scope.sendCode = function ($event) {
        if ($event.charCode === 13) {
            if ($scope.cargoObject.hasOwnProperty($scope.params.scanCode)) {
                initScanCargo()
            } else {
                swal('', '该货物不属于本次拣货范围', 'error');
            }
        }
    };

    function initScanCargo() {
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/returned/modals/scan.html',
            scope: $scope,
            size: 'xs',
            controller: 'ReturnedModalScanCtrl'
        });
    }

    /**
     * 按原料拣货
     **/
    $scope.itemMap = [];
    $scope.addItem = function (data) {
        var item = {
            material: {
                materialName: data.materialName,
                shippedAmount: data.shippedAmount,
                actualAmount: 0,
                rawMaterialCode: data.rawMaterialCode,
                progress: '0%'
            },
            cargoGrid: {
                primaryId: 'cargoCode',
                kendoSetting: {
                    columns: [
                        {field: "cargoName", title: "货物名称"},
                        {field: "cargoCode", title: "货物编码"},
                        {field: "rawMaterialName", title: "所属原料"},
                        {
                            field: "number", title: "规格", template: function (data) {
                                return data.number + getTextByVal($scope.cargoConfigure, data.measurementCode)
                            }
                        },
                        {field: "actualAmount", title: "实拣数量"},
                        {field: "memo", title: "备注"},
                        {command: [{name: 'delete', text: "删除", click: delCargo}], title: "操作"}
                    ]
                }
            }
        };
        $scope.itemMap.push(item);
    };

    $scope.addCargo = function (index) {
        // $scope.index = index
        initCargoModal(index)
    };

    function initCargoModal(index) {
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/common/modals/addCargoWithMaterial.html',
            size: 'lg',
            controller: 'AddCargoWithMaterialCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        $scope.cargoList = data;
                        var dataSource = $scope.itemMap[index].cargoGrid.kendoGrid.dataSource;
                        dataSource.data([]);
                        $scope.itemMap[index].material.actualAmount = 0
                        _.each(data, function (item) {
                            // 添加隐藏数据index 方便删除数据
                            item['index'] = $scope.index;
                            dataSource.add(item);
                            $scope.itemMap[index].material.actualAmount += parseInt(item.actualAmount) * parseInt(item.number)
                            $scope.itemMap[index].material.progress = parseFloat(parseInt($scope.itemMap[index].material.actualAmount) / parseInt($scope.itemMap[index].material.shippedAmount) * 100).toFixed(2) + '%'
                        });
                        $scope.addModal.close()
                    }
                },
                data: {
                    cl: $scope.itemMap[index].cargoGrid.kendoGrid.dataSource.data(),
                    m: $scope.itemMap[index].material,
                    cargoUnit: $scope.cargoConfigure
                }
            }
        })
    }

    function delCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.itemMap[dataItem['index']].cargoGrid.kendoGrid.dataSource.remove(dataItem)
    }

    $scope.bill = {
        billType: 'RETURNED',
        specificBillType: 'RETURNED',
        billPurpose: 'OUT_STORAGE'
    };

    $scope.save = function () {
        saveOrSubmit('save', _.cloneDeep($scope.bill))
    };

    $scope.submit = function () {
        saveOrSubmit('submit', _.cloneDeep($scope.bill))
    };
    function saveOrSubmit(type, bill) {
        var url = '';
        if (type === 'save') {
            url = '/api/bill/returned/save'
        } else {
            url = '/api/bill/returned/submit'
        }
        _.each([ 'planMemo', 'outStorageMemo', 'sourceCode'], function (name) {
            bill[name] = $scope.params[name]
        });

        bill.sourceCode = $scope.params.billCode;
        bill.rootCode = $scope.params.rootCode;
        bill.outLocation = {
            stationCode: $scope.params.outStationCode,
            stationName: $scope.params.outStationName,
            // stationType: $.cookie('STORE'),
            storage: {
                storageCode: $scope.params.outStorageType,
                storageName: getTextByVal($scope.storageType, $scope.params.outStorageType)
            }
        };
        bill.supplier = {
            supplierCode: $scope.params.supplier.supplierCode
        };
        // bill.inLocation = {
        //     stationCode: $scope.params.inStationCode,
        //     stationName: $scope.params.inStationName,
        //     // stationType: 'LOGISTICS',
        //     storage: {
        //         storageCode: 'ON_STORAGE',
        //         storageName: ''
        //     }
        // };

        if (getActiveVal() === 'cargo') {
            bill.basicEnum = 'BY_CARGO';
            // 按货物拣货
            bill.billDetails = _.map($scope.cargoGrid.kendoGrid.dataSource.data(), function (item) {
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
                    shippedAmount: item.shippedAmount
                }
            })
        } else {
            bill.basicEnum = 'BY_MATERIAL';
            bill.billDetails = [];
            _.each($scope.itemMap, function (item) {
                _.each(item.cargoGrid.kendoGrid.dataSource.data(), function (data) {
                    bill.billDetails.push({
                        rawMaterial: {
                            rawMaterialCode: data.rawMaterialCode,
                            rawMaterialName: data.rawMaterialName,
                            cargo: {
                                cargoCode: data.cargoCode,
                                cargoName: data.cargoName
                            }
                        },
                        actualAmount: data.actualAmount,
                        shippedAmount: item.material.shippedAmount
                    })
                })
            })
        }
        ApiService.post(url, bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                $state.go('app.bill.returned.outStorageList');
            }
        }, apiServiceError);
        $scope.$close();
    }

    //判断提交类型
    function getActiveVal() {
        if ($('#tabs').children('li:first-child').hasClass('active')) {
            return 'cargo'
        }
        else {
            return 'material'
        }
    }
});