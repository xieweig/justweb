'use strict';

angular.module('app').controller('outViewCtrl', function ($scope, ApiService) {
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
    
    // ApiService.get().then(function (response) {
    //
    // })
    
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
            columns: [
                {field: "billType", title: "货物名称"},
                {field: "outStatus", title: "货物编码"},
                {field: "inputStatus", title: "所属原料"},
                {field: "standardUnit", title: "标准单位"},
                {field: "number", title: "规格"},
                {field: "pick", title: "实拣数量"},
                {field: "standardNum", title: "标准单位数量"}
            ]
        }
    }

    $scope.onlyCargoGrid = {
        primaryId: 'code',
        kendoSetting: {
            columns: [
                {field: "billType", title: "货物名称"},
                {field: "outStatus", title: "货物编码"},
                {field: "inputStatus", title: "所属原料"},
                {field: "standardUnit", title: "标准单位"},
                {field: "number", title: "规格"},
                {field: "pickNumber", title: "应拣数量"},
                {field: "pick", title: "实拣数量"},
                {field: "standardNum", title: "标准单位数量"}
            ]
        }
    }
});