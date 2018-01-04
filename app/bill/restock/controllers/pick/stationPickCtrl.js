'use strict';

angular.module('app').controller('stationPickCtrl', function ($scope, $state, $stateParams, $uibModal, $timeout, ApiService) {
    $scope.params = {};

    $scope.outType = [
        // {key: '1', value: '1', text: '正常库'},
        {key: '2', value: '2', text: '仓储库'},
        {key: '3', value: '3', text: '进货库'},
        {key: '4', value: '4', text: '退货库'},
        {key: '5', value: '5', text: '在途库'},
        {key: '6', value: '6', text: '预留库'}
    ];

    $scope.change = function () {};
    // 获取计划单信息
    ApiService.get('http://localhost:5000/api/bill/restock/findPlanOne?id=' + $stateParams.pickId, {hasHost: true}).then(function (response) {
        if (response.code === '000') {
            var res = response.result.content[0];
            $scope.params.billCode = res.billCode;
            $scope.params.memo = res.remarks;
            $scope.params.recordTime = res.recordTime;
            $scope.params.outStationName = res.outStationName;
            $scope.params.inStationName = res.inStationName;
            $scope.params.type = res.type;

            if (res.type === 'material') {
                // 按原料拣货，不要要考虑货物
                $timeout(function () {
                    $('#tabs').children('li:eq(1)').children('a').click();
                    _.each(res.materialList, function (item) {
                        $scope.addItem(item)
                    })
                }, 1)
            } else {
                // 按货物拣货，需要考虑原料
                $timeout(function () {
                    var dataSource = $scope.cargoGrid.kendoGrid.dataSource;
                    for (var i in res.cargoList) {
                        dataSource.add({
                            cargoName: res.cargoList[i].cargoName,
                            cargoCode: res.cargoList[i].cargoCode,
                            rawMaterialId: res.cargoList[i].rawMaterialId,
                            number: res.cargoList[i].number,
                            pickNumber: res.cargoList[i].pickNumber
                        })
                    }
                }, 1)

                // TODO: 按货物拣货->按原料 提示
                $scope.change = function (e) {
                    swal({
                        title: '提示',
                        text: '你将要从货物操作切换到原料操作，切换后之前的数据将被清空，请问是否确定切换？',
                        type: 'warning',
                        showCancelButton: true,
                    }).then(function (result) {
                        if (result.value) {
                            $('#tabs').children('li:first-child').children('a').attr('data-toggle', null)
                            $('#tabs').children('li:first-child').children('a').click(function (e) {
                                e.preventDefault()
                            })
                            $scope.change = function () {
                            }
                            // 计算原来各种原料的需求，再addItem
                        } else {
                            $('#tabs').children('li:first-child').children('a').click()
                        }
                    })
                }
            }
        } else {
            swal('请求失败', response.message, 'error');
        }
    }, apiServiceError)

    /**
     * 按货物拣货
     **/
    $scope.cargoGrid = {
        primaryId: 'cg',
        kendoSetting: {
            editable: true,
            columns: [
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "number", title: "规格"},
                {field: "pickNumber", title: "应拣数量"},
                {field: "realNumber", title: "实拣数量"},
                {field: "remarks", title: "备注", editable: true}
            ]
        }
    };

    // 测试回车监听
    $scope.sendCode = function ($event) {
        if ($event.charCode === 13) {
            // APIService
            initScanCargo()
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
                materialNumber: data.pickNumber,
                rawMaterialId: data.rawMaterialId,
                progress: '0%'
            },
            cargoGrid: {
                primaryId: 'cargoCode',
                kendoSetting: {
                    columns: [
                        {field: "cargoNmae", title: "货物名称"},
                        {field: "cargoCode", title: "货物编码"},
                        {field: "rawMaterialId", title: "所属原料"},
                        {field: "number", title: "规格"},
                        {field: "realNumber", title: "实拣数量"},
                        {field: "remarks", title: "备注"},
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
        $scope.addModal = $scope.addModal = $uibModal.open({
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
                        _.each(data, function (item) {
                            // 添加隐藏数据index 方便删除数据
                            item['index'] = $scope.index;
                            dataSource.add(item)
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

    // save
    $scope.save = function () {
        // getActiveVal()
    };

    $scope.submit = function () {

    };
    
    $scope.reset = function () {
        _.each($scope.itemMap, function (item) {
            item.cargoGrid.kendoGrid.dataSource.data([])
        })
    }

    // 判断提交类型
    // function getActiveVal() {
    //     if ($('#tabs').children('li:first-child').hasClass('active')) {
    //         alert(1)
    //     }
    //     else {
    //         alert(2)
    //     }
    // }

    //TODO: 按货物拣货 输入数字验证
});