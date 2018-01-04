'use strict';

angular.module('app').controller('outEditCtrl', function ($scope, $uibModal) {
    $scope.params = {
        materialName: 'tkcdx12345',
        createTime: "2017-01-01",
        outTime: '2017-01-02',
        creatorName: '王菲',
        checkName: '王菲菲',
        outStationName: '重庆北城店',
        outType: '正常库',
        inStationName: '重庆物流',
        billType: '退库计划转',
        outStatus: '未出库',
        subStatus: '已提交',
        audStatus: '未审核',
        outNumber: '35',
        outCargoType: '2',
        planMemo: '111',
        outMemo: '222',
        checkMemo: '333'
    };

    $scope.showMaterial = true;

    $scope.MaterialGrid = {
        primaryId: 'code',
        kendoSetting: {
            columns: [
                {field: "materialName", title: "原料名称"},
                {field: "materialCode", title: "原料编码"},
                {field: "pickNumber", title: "应拣数量"},
                {field: "pick", title: "实拣数量"},
                {field: "progress", title: "完成度"}
            ]
        }
    };

    $scope.CargoGrid = {
        primaryId: 'code',
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
                {field: "number", title: "规格"},
                {field: "pick", title: "实拣数量", editable: true},
                {field: "standardNum", title: "标准单位数量"}
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
                    })
                    material.progress = ((material.pick / material.pickNumber)*100).toString() + '%';
                })
                $scope.MaterialGrid.kendoGrid.refresh();
                return e;
            }
        }
    }

    $scope.onlyCargoGrid = {
        primaryId: 'code',
        kendoSetting: {
            editable: true,
            columns: [
                {title: '操作', command: [{name: 'del', text: "删除", click: delWithCargo}], width: 140},
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "inputStatus", title: "所属原料"},
                {field: "standardUnit", title: "标准单位"},
                {field: "number", title: "规格"},
                {field: "pickNumber", title: "应拣数量"},
                {field: "pick", title: "实拣数量"},
                {field: "standardNum", title: "标准单位数量"}
            ]
        }
    };

    $scope.addCargo = function () {
        var dataSource = $scope.CargoGrid.kendoGrid.dataSource;
        initAddModal(dataSource)
    };

    function initAddModal(data) {
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
                        // var dataSource = $scope.CargoGrid.kendoGrid.dataSource;
                        // dataSource.data([])
                        // for (var i = 0; i < data.length; i++) {
                        //     dataSource.add(data[i])
                        // }
                        // TODO: 回调原料数据
                        $scope.addModal.close()
                    }
                },
                data: {
                    cl: $scope.CargoGrid.kendoGrid.dataSource.data(),
                    m: $scope.MaterialGrid.kendoGrid.dataSource.data()
                }
            }
        });
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
                item.pick = (parseInt(item.pick) - parseInt(dataItem.number)) * parseInt(dataItem.pick);
                $scope.MaterialGrid.kendoGrid.refresh();
            }
        })
    }

    setTimeout(function () {
        var mds = $scope.MaterialGrid.kendoGrid.dataSource;
        mds.add({
            "materialName": "咖啡豆",
            "materialCode": "111",
            "pickNumber": "10000",
            "pick": "0",
            "progress": ""
        })
    }, 100);

    /**
     按货物拣货退库
     */
    $scope.addOnlyCargo = function () {
        var dataSource = $scope.onlyCargoGrid.kendoGrid.dataSource;
        initAddCargoModal(dataSource)
    };

    function initAddCargoModal(data) {
        $scope.addModal = $uibModal.open({
            templateUrl: 'app/bill/common/modals/addCargoWithMaterial.html',
            size: 'lg',
            controller: 'AddCargoWithMaterialCtrl',
            resolve: {
                cb: function () {
                    return function (data) {
                        console.log(data)
                        $scope.cargoList = data;
                        var dataSource = $scope.onlyCargoGrid.kendoGrid.dataSource;
                        for (var i = 0; i < dataSource._total; i++) {
                            dataSource.remove(dataSource.at(i))
                        }
                        for (var i = 0; i < data.length; i++) {
                            dataSource.add(data[i])
                        }
                        $scope.addModal.close()
                    }
                },
                data: {
                    cl: $scope.onlyCargoGrid.kendoGrid.dataSource.data(),
                    m: {
                        materialName: '1'
                    }
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
});