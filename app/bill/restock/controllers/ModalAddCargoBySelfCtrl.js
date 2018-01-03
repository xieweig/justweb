'use strict';

angular.module('app').controller('ModalAddCargoBySelfCtrl', function ($scope, $timeout, ApiService) {
    // 拣货的添加货物
    $scope.params = {};

    // 搜索
    // $scope.search = function () {
    //     $scope.search.kendoGrid.dataSource.page(1);
    // };

    // 搜索参数
    $scope.kendoQueryCondition = {};

    // 查询结果表格
    $scope.searchGrid = {
        primaryId: 'cargoCode',
        url: '/api/baseInfo/cargo/findByCondition',
        params: $scope.kendoQueryCondition,
        kendoSetting: {
            autoBind: false,
            persistSelection: true,
            columns: [
                {selectable: "row"},
                {field: "cargoCode", title: "货物编码"},
                {field: "originalName", title: "货物内部名称"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "barCode", title: "货物条码"},
                {field: "selfBarCode", title: "自定义条码"},
                {field: "effectiveTime", title: "保质期(天)"},
                {
                    field: "number", title: "规格", template: function (data) {
                        return data.number
                    }
                },
                {
                    title: "最小标准单位", template: function (data) {
                        return ''
                    }
                },
                {field: "createdTime", title: "建档时间", format: '{0: yyyy-MM-dd HH:mm}'},
                {field: "memo", title: "备注"}
            ]
        }
    };

    // 已选中货物表格
    $scope.currentCargoGrid = {
        kendoSetting: {
            editable: true,
            columns: [
                {command: [{name: 'select', text: "删除", click:delCurCargo}], title: "", width: 80},
                {field: "cargoName", title: "货物名称"},
                {field: "cargoCode", title: "货物编码"},
                {field: "rawMaterialId", title: "所属原料"},
                {field: "standardUnit", title: "标准单位"},
                {field: "number", title: "规格"},
                {field: "cargoNumber", title: "货物数量", editable: true,}
            ]
        }
    };

    // 同步表格数据
    $timeout(function () {
        for (var i = 0; i < $scope.CargoListGrid.kendoGrid.dataSource._total; i++)
            $scope.currentCargoGrid.kendoGrid.dataSource.add($scope.CargoListGrid.kendoGrid.dataSource.at(i))
    }, 100);

    // 保存货物
    $scope.saveCargo = function () {
        var data = $scope.CargoListGrid.kendoGrid.dataSource;
        var dataSource = $scope.currentCargoGrid.kendoGrid.dataSource;
        for (var i = 0; i < data._total; i++) {
            dataSource.remove(data.at(i))
        }
        for (var i = 0; i < dataSource._total; i++) {
            data.add(dataSource.at(i))
        }
        $scope.addModal.close()
    };

    // 删除货物
    $scope.delCargo = function () {
        var selectId = $scope.currentCargoGrid.kendoGrid.selectedKeyNames();
        var dataSource = $scope.currentCargoGrid.kendoGrid.dataSource;
        for (var j in selectId) {
            for (var i = 0; i < dataSource._total; i++) {
                if (dataSource.at(i).code.toString() === selectId[j]) {
                    dataSource.remove(dataSource.at(i));
                }
            }
        }
    };

    function delCurCargo(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $scope.currentCargoGrid.kendoGrid.dataSource.remove(dataItem)
    }

    // 测试用 之后删除  TODO:如果一条直接添加进当前选中货物
    $scope.search = function () {
        // ApiService.get().then()
        $scope.searchGrid.kendoGrid.dataSource.add({
            cargoCode: "hw001",
            originalName: "咖啡豆001",
            rawMaterialId: "咖啡豆",
            barCode: "货物条码",
            selfBarCode: "-",
            effectiveTime: "180",
            number: '',
            createdTime: "2017-01-01",
            memo: "备注"
        });

        $scope.searchGrid.kendoGrid.dataSource.add({
            cargoCode: "hw002",
            originalName: "咖啡豆002",
            rawMaterialId: "咖啡豆",
            barCode: "货物条码",
            selfBarCode: "-",
            effectiveTime: "180",
            number: '',
            createdTime: "2017-01-01",
            memo: "备注"
        })
    };

    $scope.addSelectCargo = function () {
      var selectId = $scope.searchGrid.kendoGrid.selectedKeyNames();
      // console.log(selectId)
      if(selectId.length === 1){
          for(var i=0;i<$scope.searchGrid.kendoGrid.dataSource._total;i++){
              if($scope.searchGrid.kendoGrid.dataSource.at(i).cargoCode.toString() === selectId[0]){
                  $scope.currentCargoGrid.kendoGrid.dataSource.add($scope.searchGrid.kendoGrid.dataSource.at(i))
              }
          }
      }else{
          alert('plz select one.')
      }
    };

});