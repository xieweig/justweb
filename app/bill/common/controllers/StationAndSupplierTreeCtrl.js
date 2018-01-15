'use strict';

angular.module('app').controller('StationAndSupplierTreeCtrl', function ($scope, $rootScope, $timeout, options) {
    var currentType = 'station';
    $timeout(function () {
        $('.tab-pane .nav-tabs a').click(function () {
            currentType = $(this).attr('tabType');
        });
    });
    var currentOption = _.cloneDeep(options);
    $scope.sortable = currentOption.sortable;
    var stationType = !options.type ? '' : options.type;
    // 用于接下来判断是单选还是多选  返回值会不同
    var isMultiple = _.isUndefined(currentOption.checkboxes) || currentOption.checkboxes !== false;
    $scope.treeViewOptions = {
        dataSource: {
            data: $rootScope.getStationTree(stationType, true),
            schema: {
                model: {
                    children: "items"
                },
                data: function (data) {
                    console.log(data);
                    return data;
                }
            }
        },
        loadOnDemand: false,
        checkboxes: {
            checkChildren: true
        },
        template: '#: item.text #<input class="stationId" type="hidden" value="#: item.key #"/><input class="stationCode" type="hidden" value="#: item.value #"/><input class="stationName" type="hidden" value="#: item.text #"/><input class="stationType" type="hidden" value="#: item.type #"/>'
    };
    currentOption.checkboxes === false ? $scope.treeViewOptions.checkboxes = false : '';
    currentOption.check ? $scope.treeViewOptions.check = currentOption.check : '';
    $timeout(function () {
        $scope.treeViewOptions.treeView.collapse(".k-item");
    });


    $scope.supplierOptions = {
        url: COMMON_URL.baseInfo + '/api/v1/baseInfo/supplier/findBySupplierName',
        data: {supplierName: ''},
        schema: {
            type: "json",
            model: {
                id: "supplierCode",
                hasChildren: "group"
            },
            data: function (data) {
                if (data.code) {
                    if (data.code !== '000') {
                        swal('', data.message, 'error');
                        return [];
                    } else {
                        return data.result.result;
                    }
                } else {
                    return data;
                }
            }
        },
        template: '#: item.supplierName #'
        + '<input class="supplierName" type="hidden" value="#: item.supplierName #"/>'
        + '<input class="supplierCode" type="hidden" value="#: item.supplierCode #"/>'
    };
    // 如果是单选 则只有原料有选择框
    currentOption.check ? $scope.supplierOptions.check = currentOption.check : '';
    isMultiple ? $scope.supplierOptions.checkboxes = {
        checkChildren: true
    } : '';

    // 拖拽排序
    if (currentOption.sortable) {
        $scope.sortableList = [];
        $scope.treeViewOptions.check = function (e) {
            console.log(e);
        };
        $scope.addSortable = function () {
            var result = [];
            checkedNodeIds($scope.treeViewOptions.treeView.dataSource.view(), result);
            $scope.sortableList = result
        };
        $timeout(function () {
            $("#sortable").kendoSortable({
                handler: ".handler",
                hint: function (element) {
                    return element.clone().addClass("hint");
                }
            });
        });
    }


    // 根据条件筛选
    $scope.filter = function () {
        var filterName = $scope.filterName || '';
        var filterCode = $scope.filterCode || '';
        $scope.treeViewOptions.treeView.dataSource.filter([
            {field: "text", operator: "contains", value: filterName},
            {field: "value", operator: "contains", value: filterCode}
        ]);
    };

    // 供应商筛选
    $scope.params = {};
    $scope.filterSupplier = function () {
        if ($scope.params.supplierName) {
            $scope.supplierOptions.treeView.dataSource.read($scope.params);
        } else {
            $scope.supplierOptions.treeView.dataSource.read({supplierName: ''});
        }
    };

    // 获取选中的结果
    $scope.getSelResult = function () {
        if (currentType === 'station') {
            getStationResult();
        } else {
            getSupplierResult();
        }
    };


    // 获取站点的结果
    function getStationResult() {
        if (currentOption.sortable) {
            options.modal = [];
            $('#sortable .sortable').each(function (index) {
                var index = $(this).attr('sortableIndex');
                var item = $scope.sortableList[index];
                options.modal.push({stationId: item.stationId, type: item.type, stationCode: item.stationCode, stationName: item.stationName, cityName: item.cityName, cityCode: item.cityCode, regionCode: item.regionCode, regionName: item.regionName});
            });
            options.callback(options.modal);
        } else {
            if (isMultiple) {
                options.modal = [];
                checkedNodeIds($scope.treeViewOptions.treeView.dataSource.view(), options.modal);
                if (options.modal.length === 0) {
                    swal('请选择站点', '', 'warning');
                    return;
                }
            } else {
                var selectNode = $scope.treeViewOptions.treeView.select();
                options.modal = {
                    stationId: selectNode.find('.stationId').val(),
                    stationCode: selectNode.find('.stationCode').val(),
                    stationName: selectNode.find('.stationName').val(),
                    type: selectNode.find('.stationType').val()
                };
                // 判断是否选择了站点
                if (options.modal.type !== 'station') {
                    swal('请选择站点', '', 'warning');
                    return;
                }
            }
            // 判断有没有回调函数  有则执行
            if (_.isFunction(options.callback)) {
                options.callback(options.modal);
            }
        }
        $scope.$close();
    }

    // 获取供应商的结果
    function getSupplierResult() {
        if (isMultiple) {
            options.modal = [];
            checkedNodeIds($scope.supplierOptions.dataSource.view(), options.modal);
            if (options.onlyLeaf && options.modal.length === 0) {
                swal('请选择供应商', '', 'warning');
                return;
            }
        } else {
            var selectNode = $scope.supplierOptions.treeView.select();
            if (options.onlyLeaf && selectNode.find('.isGroup').val() === 'true') {
                swal('请选择供应商', '', 'warning');
                return;
            }
            options.modal = {
                supplierName: selectNode.find('.supplierName').val(),
                supplierCode: selectNode.find('.supplierCode').val()
            };
        }
        // 判断有没有回调函数  有则执行
        if (_.isFunction(options.callback)) {
            options.callback(options.modal);
        }
        $scope.$close();
    }

    // 递归获取选中的值
    function checkedNodeIds(nodes, checkedNodes) {
        for (var i = 0; i < nodes.length; i++) {
            var item = nodes[i];
            if (item.hasChildren) {
                checkedNodeIds(item.children.view(), checkedNodes);
            } else if (item.checked) {
                if (currentType === 'station') {
                    checkedNodes.push({stationId: item.key, type: item.type, stationCode: item.value, stationName: item.text, cityName: item.cityName, cityCode: item.cityCode, regionCode: item.regionCode, regionName: item.regionName});
                } else {
                    checkedNodes.push({supplierCode: item.supplierCode, supplierName: item.supplierName});
                }
            }
        }
    }
});