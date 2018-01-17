'use strict';

angular.module('app').controller('ProcurementEditCtrl', function ($scope, $uibModal, $timeout, $state, params, ApiService, cargoUnit, materialUnit, storageList) {
    $scope.storageList = storageList;
    // 页面类型 查看or审核
    $scope.type = params.type;
    $scope.bill = params.purchaseBill;
    params.purchaseBill.supplier = {
        supplierCode: params.purchaseBill.supplierCode,
        supplierName: params.purchaseBill.supplierName
    };

    $timeout(function () {
        $('#inStorageCode').val(params.purchaseBill.inStorageCode).trigger('change');
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
                {field: "cargo.cargoName", title: "货物名称", width: 120},
                {field: "cargo.cargoCode", title: "货物编码", width: 120},
                {field: "cargo.rawMaterialId", title: "所属原料", width: 120},
                {
                    title: "标准单位", width: 120,
                    template: function (data) {
                        return getTextByVal(materialUnit, data.cargo.measurementCode);
                    }
                },
                {
                    title: "规格", width: 120,
                    template: function (data) {
                        return data.cargo.number + '/' + getTextByVal(cargoUnit, data.cargo.standardUnitCode);
                    }
                },
                {field: "cargo.dateInProduced", title: "生产日期", width: 160, WdatePicker: true},
                {field: "cargo.unitPrice", title: "单位进价", width: 120, kType: 'decimal'},
                {field: "cargo.amount", title: "发货数量", width: 120, kType: 'number'},
                {field: "shippedNumber", title: "实收数量", width: 120, kType: 'number', editable: true},
                {field: "differenceNumber", title: "数量差额", width: 120},
                {field: "differencePrice", title: "总价差值", width: 120}
            ],
            save: function (e) {
                // 计算数量差额和总价值差
                var model = e.model;
                model.shippedNumber = parseInt(model.shippedNumber);
                model.shippedNumber !== model.shippedNumber ? model.shippedNumber = 0 : '';

                model.cargo.amount = parseInt(model.cargo.amount);
                model.differenceNumber = model.shippedNumber - model.cargo.amount;
                model.differenceNumber !== model.differenceNumber ? model.differenceNumber = 0 : '';

                model.differencePrice = (parseFloat(model.cargo.unitPrice) * model.differenceNumber).toFixed(2);
                model.differencePrice !== model.differencePrice ? model.differencePrice = 0 : '';
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
        swal({
            title: '确定要删除选中的项目吗',
            type: 'warning',
            confirmButtonText: '是的',
            showCancelButton: true
        }).then(function (res) {
            if (res.value) {
                var selectIds = $scope.procurementGrid.kendoGrid.selectedKeyNames();
                var dataSource = $scope.procurementGrid.kendoGrid.dataSource;
                // 循环需要删除的索引的反序
                var indexPos = _.chain(dataSource.data()).map(function (item, index) {
                    if (_.indexOf(selectIds, '' + item.cargoCode) > -1) {
                        return index;
                    }
                }).reverse().value();
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
                        var cargoCodes = _.map(dataSource.data(), function (item) {
                            return item.cargo;
                        });
                        _.each(data, function (item) {
                            if (_.indexOf(cargoCodes, item.cargoCode) < 0) {
                                dataSource.add({cargoCode: item.cargoCode, cargo: item});
                            }
                        });
                    }
                },
                data: function () {
                    return $scope.procurementGrid.kendoGrid.dataSource.data();
                }
            }
        });
    };

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
        } else if (!bill.storage || !bill.storage.storageCode) {
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
        var url = '';
        if (type === 'save') {
            if ($scope.type === 'edit') {
                url = '/api/bill/purchase/updatePurchaseBillToSave';
            } else {
                url = '/api/bill/purchase/savePurchaseBill';
            }
        } else {
            if ($scope.type === 'edit') {
                url = '/api/bill/purchase/updatePurchaseBillToSubmit';
            } else {
                url = '/api/bill/purchase/submitPurchaseBill';
            }
        }
        bill.station = {
            stationCode: $.cookie('currentStationCode'),
            stationName: $.cookie('currentStationName')
        };
        bill.billDetails = _.map($scope.procurementGrid.kendoGrid.dataSource.data(), function (item) {
            return {
                packageCode: item.packageCode,
                rawMaterial: {
                    rawMaterialCode: item.cargo.rawMaterialId,
                    rawMaterialName: '',
                    cargo: {
                        cargoCode: item.cargo.cargoCode,
                        cargoName: item.cargo.cargoName
                    }
                },
                dateInProduced: item.cargo.dateInProduced,
                unitPrice: item.cargo.unitPrice,
                shippedNumber: item.cargo.shippedNumber,
                amount: item.cargo.amount,
                differenceNumber: item.differenceNumber,
                differencePrice: item.differencePrice
            };
        });
        bill.operatorCode = 'YGADMIN';
        ApiService.post(url, bill).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                swal('操作成功', '', 'success').then(function () {
                    if (params.type === 'add') {
                        $state.go('app.bill.procurement.list');
                    } else {
                        $scope.$close(function () {
                            console.log(213);
                        });
                    }
                });
            }
        }, apiServiceError);
    }

});