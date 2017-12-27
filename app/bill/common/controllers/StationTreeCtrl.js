'use strict';

angular.module('app').controller('StationTreeCtrl', function ($scope, $rootScope, $timeout, options) {
    var currentOption = _.cloneDeep(options);
    var stationType = !options.type ? '' : options.type;
    // 用于接下来判断是单选还是多选  返回值会不同
    var isMultiple = _.isUndefined(currentOption.checkboxes) || currentOption.checkboxes !== false;
    $scope.treeViewOptions = {
        dataSource: {
            data: $rootScope.getStationTree(stationType),
            schema: {
                model: {
                    children: "items"
                }
            }
        },
        checkboxes: {
            checkChildren: true
        },
        template: '#: item.text #<input class="stationId" type="hidden" value="#: item.key #"/><input class="stationCode" type="hidden" value="#: item.value #"/><input class="stationName" type="hidden" value="#: item.text #"/><input class="stationType" type="hidden" value="#: item.type #"/>'
    };
    currentOption.checkboxes === false ? $scope.treeViewOptions.checkboxes = false : '';
    currentOption.check ? $scope.treeViewOptions.check = currentOption.check : '';

    // 根据条件筛选
    $scope.filter = function () {
        var filterName = $scope.filterName || '';
        var filterCode = $scope.filterCode || '';
        $scope.treeViewOptions.treeView.dataSource.filter([
            { field: "text", operator: "contains", value: filterName },
            { field: "value", operator: "contains", value: filterCode }
        ]);
    }

    // 获取选中的结果
    $scope.getSelResult = function () {
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
                id: selectNode.find('.stationId').val(),
                value: selectNode.find('.stationCode').val(),
                name: selectNode.find('.stationName').val(),
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
        $scope.$close();
    };

    // 递归获取选中的值
    function checkedNodeIds(nodes, checkedNodes) {
        for (var i = 0; i < nodes.length; i++) {
            var item = nodes[i];
            if (item.hasChildren) {
                checkedNodeIds(item.children.view(), checkedNodes);
            } else if (item.checked) {
                checkedNodes.push({ stationId: item.key, type: item.type, stationCode: item.value, stationName: item.text, cityName: item.cityName, cityCode: item.cityCode, regionCode: item.regionCode, regionName: item.regionName });
            }
        }
    }
});