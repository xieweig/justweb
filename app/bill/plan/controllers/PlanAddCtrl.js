'use strict';

angular.module('app').controller('PlanAddCtrl', function ($scope) {

    $('#grid').on('click','.kendo-btn-a',function () {

    })
    
    // 项目数组
    $scope.itemMap = [];
    $scope.addItem = function () {
        var item = {
            unfurled: true,
            cargo: {},
            stationGrid: {
                primaryId: 'stationCode',
                params: $scope.kendoQueryCondition,
                kendoSetting: {
                    height: 150,
                    editable: true,
                    autoBind: false,
                    columns: [
                        { field: "inStationName", title: "调出站点" },
                        { field: "outStationName", title: "调入站点" },
                        { field: "outStationName", title: "调入站点" ,template:function () {
                                return '<a class="kendo-btn-a"></a>';
                            }},
                        { field: "number", title: "调剂数量(点击修改)", editable: true },
                        { command: [{ name: 'destroy', text: "删除" }], title: "操作", width: 155 }
                    ]
                }
            }
        }
        $scope.itemMap.push(item);
    };

    // 伸缩项
    $scope.scaling = function (index) {
        $scope.itemMap[index].unfurled = !$scope.itemMap[index].unfurled;
    }

    // 添加货物
    $scope.addCargo = function (index) {
        $scope.itemMap[index].cargo = {
            cargoName: '货物',
            cargoCode: 'CODE001',
            barCode: '1564646465',
            selfBarCode: '1564646465',
            materialName: '咖啡豆',
            number: '100',
            measurementName: 'g/包',
            class: '分类'
        };
    }

    // 清空货物
    $scope.clearCargo = function (index) {
        $scope.itemMap[index].cargo = {};
    }

    // 添加站点
    $scope.addStation = function (index) {
        var item = {
            stationCode: generateMixed(10),
            inStationName: '调入站点',
            outStationName: '调出站点',
            number: '0'
        };
        $scope.itemMap[index].stationGrid.kendoGrid.dataSource.add(item);
    }


    // 清空站点
    $scope.clearStation = function (index) {
        var item = $scope.itemMap[index];
        item.stationGrid.kendoGrid.dataSource.data([]);
    }
});