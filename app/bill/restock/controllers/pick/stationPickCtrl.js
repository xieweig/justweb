'use strict';

angular.module('app').controller('stationPickCtrl', function ($scope, $state, $stateParams, $uibModal, $timeout, ApiService, Common) {
    $scope.params = {};
    // 将按货物拣货获得的obj存储起来用于判断扫描的货物是否有效
    $scope.cargoObject = {};

    $scope.outType = [];
    // 获取当前站点
    Common.getStore().then(function (storage) {
        $scope.storage = storage;
        _.each(storage, function (item) {
            $scope.outType.push({
                key: item.tempStorageCode,
                value: item.tempStorageCode,
                text: item.tempStorageName
            })
        });
        // 设置默认值
        $timeout(function () {
            $('#select-out').val($scope.outType[0].value).trigger('change')
        })
    });

    $scope.change = function () {
    };

    // 获取计划单信息
    ApiService.post('/api/bill/planBill/findByBillCode?billCode=' + $stateParams.pickId).then(function (response) {
        if (response.code === '000') {
            var res = response.result.planBill;
            // 判断按什么拣货
            _.each(['basicEnum', 'billCode', 'memo', 'createTime', 'updateTime', 'rootCode'], function (name) {
                $scope.params[name] = res[name]
            });
            $scope.params.outStationName = getTextByVal($scope.station, res.outStationCode);
            $scope.params.inStationName = getTextByVal($scope.station, res.inStationCode);

            if (res.basicEnum === 'BY_MATERIAL') {
                // 按原料拣货
                $timeout(function () {
                    $('#tabs').children('li:eq(1)').children('a').click();

                    var materialList = _.map(res.childPlanBillDetails, function (item) {
                        return item.goodsCode
                    });

                    Common.getMaterialByIds(materialList).then(function (materialList) {
                        var materialObject = _.zipObject(_.map(materialList, function (item) {
                            return item.materialCode
                        }), materialList);
                        console.log(materialObject);
                        _.each(res.childPlanBillDetails, function (item) {
                            console.log(materialObject);
                            $scope.addItem({
                                materialName: materialObject[item.goodsCode],
                                rawMaterialId: item.goodsCode,
                                shippedAmount: item.amount
                            })
                        })
                    })
                })
            } else {
                // 按货物拣货，需要考虑原料
                $timeout(function () {
                    var details = res.childPlanBillDetails;
                    var cargoList = _.map(details, function (item) {
                        return item.goodsCode
                    });
                    Common.getCargoByCodes(cargoList).then(function (cargoList) {
                        // cargoList: 货物详细信息
                        var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                            return item.cargoCode
                        }), cargoList);
                        $scope.cargoObject = cargoObject;
                        _.each(details, function (item) {
                            item.cargo = cargoObject[item.goodsCode];
                            console.log(cargoObject)
                            $scope.cargoGrid.kendoGrid.dataSource.add({
                                cargoName: item.cargo.cargoName,
                                cargoCode: item.cargo.cargoCode,
                                rawMaterialName: item.cargo.rawMaterialName,
                                number: item.cargo.number,
                                standardUnitCode: item.cargo.standardUnitCode,
                                shippedAmount: item.amount // amount是请求的数据来的
                            })
                        });
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
                            var tabBtn = $('#tabs').children('li:first-child').children('a')
                            tabBtn.attr('data-toggle', null);
                            tabBtn.click(function (e) {
                                e.preventDefault()
                            });
                            $scope.change = function () {
                                // 屏蔽掉原change函数
                            };
                            // 计算原来各种原料的需求，再addItem
                            var materialList = _.map($scope.cargoGrid.kendoGrid.dataSource.data(), function (item) {
                                console.log('++++', item);
                                return 1
                            });
                            Common.getMaterialByCodes(materialList).then(function (materialList) {
                                var materialObject = _.zipObject(_.map(materialList, function (item) {
                                    return item.materialCode
                                }), materialList);
                                _.each(res.childPlanBillDetails, function (item) {
                                    $scope.addItem({
                                        materialName: materialObject[item.goodsCode],
                                        rawMaterialId: item.goodsCode,
                                        shippedAmount: parseInt(item.amount) * parseInt(item.cargo.number)
                                    })
                                })
                            })
                        } else {
                            $('#tabs').children('li:first-child').children('a').click()
                        }
                    })
                }
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
                {field: "rawMaterialId", title: "所属原料"},
                // {field: "number", title: "规格"},
                {title: "规格", template: "#: number #/#: standardUnitCode #"},
                {field: "shippedAmount", title: "应拣数量"},
                {field: "actualAmount", title: "实拣数量"},
                {field: "memo", title: "备注", editable: true}
            ]
        }
    };

    // 测试回车监听
    $scope.sendCode = function ($event) {
        if ($event.charCode === 13) {
            // APIService
            console.log($scope.cargoObject, $scope.params.scanCode)
            if ($scope.cargoObject.hasOwnProperty($scope.params.scanCode)) {
                initScanCargo()
            } else {
                swal('', '该货物不属于本次拣货范围', 'error');
            }
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
                rawMaterialId: data.rawMaterialId,
                progress: '0%'
            },
            cargoGrid: {
                primaryId: 'cargoCode',
                kendoSetting: {
                    columns: [
                        {field: "cargoName", title: "货物名称"},
                        {field: "cargoCode", title: "货物编码"},
                        {field: "rawMaterialId", title: "所属原料"},
                        {field: "number", title: "规格"},
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
        $scope.index = index;
        initCargoEdit(index)
    };

    function initCargoEdit(index) {
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/common/modals/addCargoWithMaterial.html',
            size: 'lg',
            controller: 'AddCargoWithMaterialCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        console.log(data)
                        $scope.cargoList = data;
                        var dataSource = $scope.itemMap[$scope.index].cargoGrid.kendoGrid.dataSource;
                        for (var i = 0; i < dataSource._total; i++) {
                            dataSource.remove(dataSource.at(i))
                        }
                        $scope.itemMap[$scope.index].material.actualAmount = 0
                        _.each(data, function (item) {
                            // 添加隐藏数据index 方便删除数据
                            item['index'] = $scope.index;
                            dataSource.add(item)
                            $scope.itemMap[$scope.index].material.actualAmount += parseInt(item.actualAmount) * parseInt(item.number)
                            $scope.itemMap[$scope.index].material.progress = parseFloat(parseInt($scope.itemMap[$scope.index].material.actualAmount) / parseInt($scope.itemMap[$scope.index].material.shippedAmount) * 100).toFixed(2) + '%'
                        });
                        $scope.addModal.close()
                    }
                },
                data: {
                    cl: $scope.itemMap[index].cargoGrid.kendoGrid.dataSource.data(),
                    m: $scope.itemMap[index].material
                }
            }
        });
    }

    function delCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        console.log(dataItem);
        $scope.itemMap[dataItem['index']].cargoGrid.kendoGrid.dataSource.remove(dataItem)
    }

    $scope.bill = {};

    // save
    $scope.save = function () {
        saveOrAudit('save', _.cloneDeep($scope.bill))
    };

    $scope.submit = function () {
        saveOrAudit('submit', _.cloneDeep($scope.bill))
    };

    $scope.reset = function () {
        _.each($scope.itemMap, function (item) {
            item.cargoGrid.kendoGrid.dataSource.data([])
        })
    }

    function saveOrAudit(type, bill) {
        var url = '';
        if (type === 'save') {
            url = '/api/bill/restock/saveRestockBill'
        } else {
            url = '/api/bill/restock/submitRestockBill'
        }
        bill.billCode = $scope.params.billCode;
        bill.billProperty = 'RESTOCK';
        bill.planMemo = $scope.params.memo;
        bill.outMemo = '';
        bill.sourceCode = $scope.params.billCode;
        bill.planMemo = $scope.params.memo;
        // bill.operatorCode = $.cookie('userCode')
        bill.totalPrice = '12345'
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
        if (getActiveVal() === 'cargo') {
            bill.basicEnum = 'BY_CARGO';
            // 按货物拣货
            bill.billDetails = _.map($scope.cargoGrid.kendoGrid.dataSource.data(), function (item) {
                return {
                    rawMaterial: {
                        rawMaterialCode: item.rawMaterialId,
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
            bill.basicEnum = 'BY_MATERIAL'
            // 按原料拣货
            bill.billDetails = [];
            _.each($scope.itemMap, function (item) {
                console.log('#', item)
                _.each(item.cargoGrid.kendoGrid.dataSource.data(), function (data) {
                    console.log('##', data)
                    bill.billDetails.push({
                        rawMaterial: {
                            rawMaterialCode: data.rawMaterialId,
                            rawMaterialName: data.rawMaterialName,
                            cargo: {
                                cargoCode: data.cargoCode,
                                cargoName: data.cargoName
                            }
                        },
                        actualAmount: data.actualAmount,
                        shippedAmount: ''
                    })
                })
            })
        }

        ApiService.post(url, bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                alert('success')
                // $state.go('app.bill.procurement.list');
            }
        }, apiServiceError)
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

    //TODO: 按货物拣货 输入数字验证
});