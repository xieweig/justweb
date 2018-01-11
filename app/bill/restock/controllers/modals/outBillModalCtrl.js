'use strict';

angular.module('app').controller('outBillModalCtrl', function ($scope, $timeout, $uibModal, ApiService, Common, data) {
    /**
     查看站点退库计划弹窗
     */
    $scope.params = {};
    $scope.modalType = data.type;

    // 类型存储
    $scope.outState = [
        {value: 'NOT_OUT', text: '未出库'},
        {value: 'NOT_IN', text: '未入库'},
        {value: 'IN_ING', text: '入库中'},
        {value: 'OUT_ING', text: '出库中'},
        {value: 'OUT_FAILURE', text: '出库失败'},
        {value: 'OUT_SUCCESS', text: '出库成功'},
        {value: 'IN_FAILURE', text: '入库失败'},
        {value: 'IN_SUCCESS', text: '入库成功'},
    ];

    $scope.submitState = [
        {value: 'UNCOMMITTED', text: '未提交'},
        {value: 'SUBMITTED', text: '已提交'}
    ];

    $scope.auditState = [
        {value: 'UN_REVIEWED', text: '未审核'},
        {value: 'AUDIT_ING', text: '审核中'},
        {value: 'AUDIT_SUCCESS', text: '审核通过'},
        {value: 'AUDIT_FAILURE', text: '审核不通过'}
    ];

    $scope.MaterialGrid = {
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

    if ($scope.modalType !== 'edit') {
        $scope.CargoGrid = {
            primaryId: 'cargoName',
            kendoSetting: {
                columns: [
                    {field: "cargoName", title: "货物名称"},
                    {field: "cargoCode", title: "货物编码"},
                    {field: "rawMaterialName", title: "所属原料"},
                    {field: "standardUnitCode", title: "标准单位"},
                    // {field: "number", title: "规格"},
                    {title: "规格", template: "#: number #/#: standardUnitCode #"},
                    {field: "actualAmount", title: "实拣数量"},
                    {field: "number", title: "标准单位数量"}
                ]
            }
        };
        $scope.onlyCargoGrid = {
            primaryId: 'cargoCode',
            kendoSetting: {
                columns: [
                    {field: "cargoName", title: "货物名称"},
                    {field: "cargoCode", title: "货物编码"},
                    {field: "rawMaterialId", title: "所属原料"},
                    {field: "standardUnitCode", title: "标准单位"},
                    // {field: "number", title: "规格"},
                    {title: "规格", template: "#: number #/#: standardUnitCode #"},
                    {field: "shippedAmount", title: "应拣数量"},
                    {field: "actualAmount", title: "实拣数量"},
                    {field: "number", title: "标准单位数量"}
                ]
            }
        };
    } else {
        $scope.CargoGrid = {
            primaryId: 'cargoCode',
            kendoSetting: {
                editable: 'inline',
                columns: [
                    {
                        title: '操作',
                        command: [{name: 'del', text: "删除", click: delWithMaterial}, {name: 'edit', text: "编辑"}],
                        width: 140
                    },
                    {field: "cargoName", title: "货物名称"},
                    {field: "cargoCode", title: "货物编码"},
                    {field: "rawMaterialId", title: "所属原料"},
                    {field: "standardUnit", title: "标准单位"},
                    // {field: "number", title: "规格"},
                    {title: "规格", template: "#: number #/#: standardUnitCode #"},
                    {field: "actualAmount", title: "实拣数量", editable: true},
                    {field: "number", title: "标准单位数量"}
                ],
                save: function (e) {
                    // 循环取值
                    $scope.params.outNumber = 0;
                    _.each($scope.CargoGrid.kendoGrid.dataSource.data(), function (item) {
                        $scope.params.outNumber = parseInt($scope.params.outNumber) + parseInt(item.pick)
                    });
                    _.each($scope.MaterialGrid.kendoGrid.dataSource.data(), function (material) {
                        material.pick = 0;
                        _.each($scope.CargoGrid.kendoGrid.dataSource.data(), function (cargo) {
                            if (cargo.rawMaterialId.toString() === material.materialCode.toString()) {
                                material.pick += parseInt(cargo.number) * parseInt(cargo.pick)
                                console.log(material.pick)
                            }
                        });
                        material.progress = ((material.pick / material.pickNumber) * 100).toString() + '%';
                    });
                    $scope.MaterialGrid.kendoGrid.refresh();
                    return e;
                }
            }
        };
        // 编辑 - 仅按货物
        $scope.onlyCargoGrid = {
            primaryId: 'cargoCode',
            kendoSetting: {
                editable: true,
                autoBind: false,
                columns: [
                    {title: '操作', command: [{name: "del", text: "删除", click: delWithCargo}], width: 140},
                    {field: "cargoName", title: "货物名称"},
                    {field: "cargoCode", title: "货物编码"},
                    {field: "rawMaterialName", title: "所属原料"},
                    {field: "standardUnitCode", title: "标准单位"},
                    // {field: "number", title: "规格"},
                    {title: "规格", template: "#: number #/#: standardUnitCode #"},
                    {field: "shippedAmount", title: "应拣数量"},
                    {field: "actualAmount", title: "实拣数量", editable: true},
                    {field: "number", title: "标准单位数量"}
                ]
            }
        };
    }


    /**
     查看退库出库单
     */
    // 查看单条计划详情
    var getURL = ''
    if($scope.modalType !== 'audit'){
        getURL = '/api/bill/restock/findByRestockBillCode'
    }else{
        getURL = '/api/bill/restock/openByRestockBillCode'
    }
    ApiService.get(getURL + '?restockBillCode=' + data.billCode).then(function (response) {
        if (response.code === '000') {
            var res = response.result.RestockBill;
            _.each(['billCode', 'createTime', 'updateTime', 'inLocation', 'outLocation', 'planMemo', 'operatorName', 'totalVarietyAmount', 'totalAmount'], function (name) {
                $scope.params[name] = res[name]
            })
            $scope.params.inOrOutState = getTextByVal($scope.outState, res.inOrOutState);
            $scope.params.auditState = getTextByVal($scope.auditState, res.auditState);
            $scope.params.submitState = getTextByVal($scope.submitState, res.submitState);
            $scope.params.inStationName = getTextByVal($scope.station, res.inLocation.stationCode);
            $scope.params.outStationName = getTextByVal($scope.station, res.outLocation.stationCode);
            Common.getStore(res.inLocation.stationCode).then(function (storageList) {
                _.each(storageList, function (item) {
                    if (item.tempStorageCode === res.inLocation.stationCode) {
                        $scope.params.outstorageName = item.tempStorageName
                    }
                })
            });
            $scope.params.billType = getTextByVal($scope.billType, res.billType) + '转';
            $scope.showMaterial = (res.basicEnum !== 'BY_CARGO');

            var billDetails = [];
            var cargoList = [];
            if ($scope.showMaterial) {
                billDetails = res.billDetails;
                cargoList = _.map(billDetails, function (item) {
                    return item.goods.cargo.cargoCode
                });
                var materialList = []

                $timeout(function () {
                    Common.getCargoByCodes(cargoList).then(function (cargoList) {
                        // cargoList: 货物详细信息
                        var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                            return item.cargoCode
                        }), cargoList);
                        _.each(billDetails, function (item) {
                            item.cargo = cargoObject[item.goods.cargo.cargoCode];
                            $scope.CargoGrid.kendoGrid.dataSource.add({
                                cargoName: item.cargo.cargoName,
                                cargoCode: item.cargo.cargoCode,
                                rawMaterialName: item.cargo.rawMaterialName,
                                number: item.cargo.number,
                                standardUnitCode: item.cargo.standardUnitCode,
                                amount: item.cargo.amount,
                                actualAmount: item.actualAmount,
                                measurementCode: item.cargo.measurementCode // 保证修改已添加的货物的字段
                            });
                            // 加进原料
                            var isExist = false;
                            materialList = _.map(materialList, function (data) {
                                if (data.materialCode === item.goods.rawMaterialCode) {
                                    isExist = true;
                                    data.actualAmount += (parseInt(item.cargo.actualAmount) * parseInt(item.number))
                                }
                                return data
                            });
                            if (!isExist) {
                                // 不存在原料
                                materialList.push({
                                    materialName: '',
                                    materialCode: item.goods.rawMaterialCode,
                                    shippedAmount: '',
                                    actualAmount: 0,
                                    progress: ''
                                })
                            }
                        });
                        _.each(materialList, function (item) {
                            $scope.MaterialGrid.kendoGrid.dataSource.add(item)
                        })
                    });
                })

            } else {
                // 按货物
                billDetails = res.billDetails;
                cargoList = _.map(billDetails, function (item) {
                    return item.goods.cargo.cargoCode
                });
                Common.getCargoByCodes(cargoList).then(function (cargoList) {
                    // cargoList: 货物详细信息
                    var cargoObject = _.zipObject(_.map(cargoList, function (item) {
                        return item.cargoCode
                    }), cargoList);
                    _.each(billDetails, function (item) {
                        item.cargo = cargoObject[item.goods.cargo.cargoCode];
                        $scope.onlyCargoGrid.kendoGrid.dataSource.add({
                            cargoName: item.cargo.cargoName,
                            cargoCode: item.cargo.cargoCode,
                            rawMaterialName: item.cargo.rawMaterialName,
                            number: item.cargo.number,
                            standardUnitCode: item.cargo.standardUnitCode,
                            amount: item.cargo.amount,
                            actualAmount: item.actualAmount,
                            shippedAmount: item.shippedAmount,
                            measurementCode: item.cargo.measurementCode // 保证修改已添加的货物的字段
                        })
                    });
                })
            }
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError);

    // 导出
    $scope.export = function () {
        alert('export')
    };

    /**
     修改退库出库单
     */

    $scope.addCargo = function () {
        var dataSource = $scope.onlyCargoGrid.kendoGrid.dataSource;
        initAddModal(dataSource)
    };

    function initAddModal(data) {
        if ($scope.showMaterial) {
            $scope.addModal = $uibModal.open({
                templateUrl: 'app/bill/common/modals/addCargoWithMaterialGroup.html',
                size: 'lg',
                controller: 'AddCargoWithMaterialGroupCtrl',
                resolve: {
                    cb: function () {
                        return function (data) {
                            // 回调表格数据到外部表格
                            $scope.cargoList = data;
                            $scope.CargoGrid.kendoGrid.dataSource.data(data);
                            // 修改原料数量
                            _.each($scope.MaterialGrid.kendoGrid.dataSource.data(), function (item) {
                                item.pick = 0;
                                _.each(data, function (dataItem) {
                                    if (item.materialCode.toString() === dataItem.rawMaterialId.toString()) {
                                        item.pick += parseInt(dataItem.number) * parseInt(dataItem.pick);
                                    }
                                })
                            });
                            $scope.MaterialGrid.kendoGrid.refresh();
                            $scope.addModal.close()
                        }
                    },
                    data: {
                        cl: $scope.CargoGrid.kendoGrid.dataSource.data(),
                        m: $scope.MaterialGrid.kendoGrid.dataSource.data()
                    }
                }
            });
        } else {
            $scope.addModal = $uibModal.open({
                templateUrl: 'app/bill/common/modals/addCargoWithMaterial.html',
                size: 'lg',
                controller: 'AddCargoWithMaterialCtrl',
                resolve: {
                    cb: function () {
                        return function (data) {
                            // 回调表格数据到外部表格
                            $scope.cargoList = data;
                            $scope.onlyCargoGrid.kendoGrid.dataSource.data(data);
                            $scope.addModal.close()
                        }
                    },
                    data: {
                        cl: $scope.onlyCargoGrid.kendoGrid.dataSource.data()
                    }
                }
            });
        }
    }

    // 原料中的货物删除
    function delWithMaterial(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.CargoGrid.kendoGrid.dataSource.remove(dataItem);
        // 修改退库数量 和 品种
        $scope.params.outNumber = parseInt($scope.params.outNumber) - parseInt(dataItem.pick);
        // 修改原料
        _.each($scope.MaterialGrid.kendoGrid.dataSource.data(), function (item) {
            if (item.materialCode.toString() === dataItem.rawMaterialId.toString()) {
                item.pick = parseInt(item.pick) - (parseInt(dataItem.number) * parseInt(dataItem.pick));
            }
        });
        $scope.MaterialGrid.kendoGrid.refresh();
    }

    $scope.addOnlyCargo = function () {
        var dataSource = $scope.onlyCargoGrid.kendoGrid.dataSource;
        initAddCargoModal(dataSource)
    };

    function initAddCargoModal() {
        // var data = {}
        // data.cl = $scope.onlyCargoGrid.kendoGrid.dataSource.data();
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/common/modals/addCargoWithMaterial.html',
            size: 'lg',
            controller: 'AddCargoWithMaterialCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        // $scope.cargoList = data;
                        $scope.params.variety = 0;
                        $scope.params.amount = 0;
                        var dataSource = $scope.onlyCargoGrid.kendoGrid.dataSource;
                        dataSource.data([]);
                        _.each(data, function (item) {
                            $scope.params.variety++;
                            $scope.params.amount += parseInt(item.actualAmount)
                            dataSource.add(item)
                        });
                        console.log($scope.params.variety, $scope.params.amount)
                        $scope.addModal.close()
                    }
                },
                data: {
                    cl: $scope.onlyCargoGrid.kendoGrid.dataSource.data()
                }
            }
        });
    }

    // 删除
    function delWithCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.onlyCargoGrid.kendoGrid.dataSource.remove(dataItem);
        // 修改数量
        $scope.params.outNumber = $scope.params.outNumber - parseInt(dataItem.pick);
    }

    $scope.save = function () {
        saveOrAudit('save', {})
    };

    $scope.submit = function () {
        saveOrAudit('submit', {})
    };

    // 保存和提交
    function saveOrAudit(type, bill) {
        var url = '';
        if (type === 'save') {
            url = '/api/bill/restock/updateRestockBillToSave'
        } else {
            url = '/api/bill/restock/updateRestockBillToSubmit'
        }
        bill.billCode = $scope.params.billCode;

        bill.billDetails = _.map($scope.onlyCargoGrid.kendoGrid.dataSource.data(), function (item) {
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
        });
        ApiService.post(url, bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                alert('success')
            }
        }, apiServiceError)
    }

    /**
     * 审核退库出库单
     */
    $scope.audit = function (type) {
        var url = '';
        if (type === 'success') {
            url = '/api/bill/restock/auditSuccess'
        } else {
            url = '/api/bill/restock/auditFailure'
        }
        ApiService.post(url + '?restockBillCode=' + $scope.params.billCode).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                alert('success')
            }
        })
    }
    /**
     * 查看退库入库单
     */


});