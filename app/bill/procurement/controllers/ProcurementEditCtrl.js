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

        $timeout(function () {
            $('#inStorageCode').val(params.purchaseBill.inLocation.storage.storageCode).trigger('change');
        });
    } else {
        params.purchaseBill = {
            billDetails: [],
            supplier: {}
        }
    }

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
                {field: "rawMaterialId", title: "所属原料", width: 120},
                {
                    title: "标准单位", width: 120,
                    template: function (data) {
                        return getTextByVal(materialUnit, data.measurementCode);
                    }
                },
                {
                    title: "规格", width: 120,
                    template: function (data) {
                        return data.number + '/' + getTextByVal(cargoUnit, data.standardUnitCode);
                    }
                },
                {field: "dateInProduced", title: "生产日期", width: 160},
                {field: "unitPrice", title: "单位进价", width: 120},
                {field: "actualAmount", title: "发货数量", width: 120},
                {field: "shippedAmount", title: "实收数量", width: 120, editable: true},
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
                var model = e.model;
                model.shippedAmount = parseInt(model.shippedAmount);
                model.shippedAmount !== model.shippedAmount ? model.shippedAmount = 0 : '';

                model.actualAmount = parseInt(model.actualAmount);
                model.differenceNumber = model.shippedAmount - model.actualAmount;
                model.differenceNumber !== model.differenceNumber ? model.differenceNumber = 0 : '';

                model.differencePrice = (parseFloat(model.unitPrice) * model.differenceNumber).toFixed(2);
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
                            return item.cargoCode;
                        });
                        _.each(data, function (item) {
                            if (_.indexOf(cargoCodes, item.cargoCode) < 0) {
                                dataSource.add(item);
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
        } else if (!bill.inLocation) {
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
            if (type !== 'save' && ( !item.dateInProduced || !item.unitPrice || !item.actualAmount || !item.shippedAmount)) {
                swal('表格信息填写不完整', '', 'warning');
                return true;
            } else {
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
                    differenceNumber: item.differenceNumber,
                    totalDifferencePrice: item.differencePrice
                });
            }
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