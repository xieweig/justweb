'use strict';

angular.module('app').controller('ProcurementEditCtrl', function ($scope, $uibModal, $timeout, $state, params, ApiService, cargoUnit, materialUnit) {
    // 页面类型 查看or审核
    $scope.type = params.type;
    if (params.purchaseBill) {
        $scope.bill = params.purchaseBill;
        params.purchaseBill.supplier = {
            supplierCode: params.purchaseBill.supplier.supplierCode,
            supplierName: params.purchaseBill.supplier.supplierName
        };
    } else {
        params.purchaseBill = {
            billDetails: [],
            supplier: {},
            inLocation: {
                storage: {
                    storageCode: 'IN_STORAGE'
                }
            }
        };
    }
    $timeout(function () {
        if (params.purchaseBill.inLocation && params.purchaseBill.inLocation.storage) {
            $('#inStorageCode').val(params.purchaseBill.inLocation.storage.storageCode).trigger('change');
        }
    });

    $scope.procurementGrid = {
        primaryId: 'cargoCode',
        kendoSetting: {
            editable: 'inline',
            persistSelection: true,
            dataSource: params.purchaseBill.billDetails,
            columns: [
                {selectable: true},
                {title: "操作", width: 160, command: [{name: 'edit', text: "编辑"}]},
                {field: "cargoName", title: "货物名称", width: 120},
                {field: "cargoCode", title: "货物编码", width: 120},
                {field: "rawMaterialName", title: "所属原料", width: 120},
                {
                    title: "标准单位", width: 120,
                    template: function (data) {
                        return getTextByVal(materialUnit, data.standardUnitCode);
                    }
                },
                {
                    title: "规格", width: 120,
                    template: function (data) {
                        return data.number + getTextByVal(cargoUnit, data.measurementCode);
                    }
                },
                {field: "dateInProduced", title: "生产日期", width: 160},
                {field: "unitPrice", title: "单位进价", width: 120},
                {field: "shippedAmount", title: "发货数量", width: 120},
                {field: "actualAmount", title: "实收数量", width: 120, kType: 'number', editable: true},
                {field: "differenceNumber", title: "数量差额", width: 120},
                {
                    field: "differencePrice", title: "总价差值", width: 120,
                    template: function (data) {
                        return (parseFloat(data.unitPrice) * data.differenceNumber).toFixed(2);
                    }
                }
            ],
            save: function (e) {
                // 计算数量差额和总价值差
                var item = e.model;
                item.shippedAmount = parseInt(item.shippedAmount);
                item.shippedAmount !== item.shippedAmount ? item.shippedAmount = 0 : '';


                item.differenceNumber = parseInt(item.shippedAmount) - parseInt(item.actualAmount);
                item.differencePrice = item.differenceNumber * parseFloat(item.unitPrice);
                return e;
            }
        }
    };

    $scope.supplierTreeOpt = {
        type: 'supplier',
        single: true,
        initTip: params.purchaseBill.supplier.supplierName,
        callback: function (data) {
            $scope.bill.supplier = {
                supplierCode: data.supplierCode,
                supplierName: data.supplierName
            };
        }
    };

    // 批量删除
    $scope.batchDelete = function () {
        var selectIds = $scope.procurementGrid.kendoGrid.selectedKeyNames();
        if (selectIds.length === 0) {
            swal('请选择需要删除的项', '', 'warning');
            return;
        }
        var dataSource = $scope.procurementGrid.kendoGrid.dataSource;
        // 循环需要删除的索引的反序
        var cargoNames = [];
        var indexPos = _.chain(dataSource.data()).map(function (item, index) {
            if (_.indexOf(selectIds, '' + item.cargoCode) > -1) {
                cargoNames.push(item.cargoName);
                return index;
            }
        }).reverse().value();
        swal({
            title: '确定要删除' + cargoNames.join() + '吗',
            type: 'warning',
            confirmButtonText: '是的',
            showCancelButton: true
        }).then(function (res) {
            if (res.value) {
                // 根据反序  从最后一条开始删除
                _.each(indexPos, function (item) {
                    if (_.isNumber(item) && item >= 0) {
                        dataSource.remove(dataSource.at(item));
                    }
                });
            }
        });
    };

    // 弹出增加货物
    $scope.openAddCargoModal = function () {
        $scope.currentCargo = {};
        $uibModal.open({
            templateUrl: 'app/bill/common/modals/addCargoModal.html',
            size: 'lg',
            controller: 'AddCargoModalCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        var dataSource = $scope.procurementGrid.kendoGrid.dataSource;
                        var dataGrid = [];
                        _.each(data, function (item) {
                            if (!item.unitPrice) {
                                item.unitPrice = 0;
                            }
                            if (!item.actualAmount) {
                                item.actualAmount = 0;
                            }
                            if (!item.shippedAmount) {
                                item.shippedAmount = 0;
                            }
                            item.differenceNumber = parseInt(item.shippedAmount) - parseInt(item.actualAmount);
                            item.differencePrice = item.differenceNumber * parseFloat(item.unitPrice);
                            dataGrid.push(combinationItem(item));
                        });
                        dataSource.data(dataGrid);
                        // var cargoCodes = _.map(dataSource.data(), function (item) {
                        //     return item.cargoCode;
                        // });
                        // _.each(data, function (item) {
                        //     if (_.indexOf(cargoCodes, item.cargoCode) < 0) {
                        //         dataSource.add(item);
                        //     }
                        // });
                    }
                },
                data: function () {
                    return _.map($scope.procurementGrid.kendoGrid.dataSource.data(), function (item) {
                        return combinationItem(item);
                    });
                },
                cargoUnit: function () {
                    return cargoUnit;
                },
                materialUnit: function () {
                    return materialUnit;
                }
            }
        });
    };

    function combinationItem(item) {
        return {
            "createTime": item.createTime,
            "updateTime": item.updateTime,
            "logicStatus": item.logicStatus,
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
            "rawMaterialTypeName": item.rawMaterialTypeName,
            "dateInProduced": item.dateInProduced,
            "unitPrice": item.unitPrice,
            "actualAmount": item.actualAmount,
            "shippedAmount": item.shippedAmount,
            "differenceNumber": item.differenceNumber,
            "differencePrice": item.differencePrice
        };
    }

    // 保存
    $scope.save = function () {
        var bill = $scope.bill;
        saveOrAudit('save', _.cloneDeep(bill));
    };

    // 审核
    $scope.saveAndSubmit = function () {
        var bill = $scope.bill;
        if (!bill.freightCode) {
            swal('请输入运单单号', '', 'warning');
            return
        } else if (!bill.inLocation || !bill.inLocation.storage || !bill.inLocation.storage.storageCode) {
            swal('请选择入库库位', '', 'warning');
            return
        } else if (!bill.shippedAmount) {
            swal('请输入发货件数', '', 'warning');
            return
        } else if (!bill.actualAmount) {
            swal('请输入实收数量', '', 'warning');
            return
        } else if (!bill.supplier || !bill.supplier.supplierCode) {
            swal('请输入供应商', '', 'warning');
            return
        }
        saveOrAudit('audit', _.cloneDeep(bill));
    };

    // 回到列表页
    $scope.toList = function () {
        $state.go('app.bill.procurement.list');
    };

    function saveOrAudit(type, bill) {
        if (initSubmitData(type, bill)) {
            var url = '';
            if (type === 'save') {
                url = '/api/bill/purchase/save';
            } else {
                url = '/api/bill/purchase/submit';
            }
            bill.billPurpose = 'IN_STORAGE';
            ApiService.post(url, bill).then(function (response) {
                if (response.code !== '000') {
                    swal('', response.message, 'error');
                } else {
                    swal('操作成功', '', 'success').then(function () {
                        if (params.type === 'add') {
                            $state.go('app.bill.procurement.list');
                        } else {
                            $scope.$close();
                        }
                    });
                }
            }, apiServiceError);
        }
    }

    // 组装提交的数据
    function initSubmitData(type, bill) {
        if (!bill.inLocation) {
            bill.inLocation = {};
        }
        bill.inLocation.stationCode = $.cookie('currentStationCode');
        bill.inLocation.stationName = $.cookie('currentStationName');

        bill.operatorCode = 'YGADMIN';
        bill.billDetails = [];
        var errorItem = _.find($scope.procurementGrid.kendoGrid.dataSource.data(), function (item) {
            if (type !== 'save') {
                if (!item.dateInProduced) {
                    swal(item.cargoName + '的生产日期不能为空', '', 'warning');
                    return true;
                } else if (!item.unitPrice && item.unitPrice !== 0) {
                    swal(item.cargoName + '的单位进价不能为空', '', 'warning');
                    return true;
                } else if (!item.shippedAmount) {
                    swal(item.cargoName + '的发货数量不能为空', '', 'warning');
                    return true;
                } else if (!item.actualAmount) {
                    swal(item.cargoName + '的实收数量不能为空', '', 'warning');
                    return true;
                }
            }
            var differenceNumber = parseInt(item.shippedAmount) - parseInt(item.actualAmount);
            bill.billDetails.push({
                packageCode: item.packageCode,
                rawMaterial: {
                    rawMaterialCode: item.rawMaterialId,
                    rawMaterialName: '',
                    cargo: {
                        cargoCode: item.cargoCode,
                        cargoName: item.cargoName
                    }
                },
                dateInProduced: item.dateInProduced,
                unitPrice: item.unitPrice,
                shippedAmount: item.shippedAmount,
                actualAmount: item.actualAmount,
                differenceNumber: differenceNumber,
                totalDifferencePrice: differenceNumber * parseFloat(item.unitPrice)
            });
            return false;
        });
        if (errorItem) {
            return false
        } else if (type !== 'save' && bill.billDetails.length === 0) {
            swal('请添加货物', '', 'warning');
            return false;
        }
        return true;
    }
});