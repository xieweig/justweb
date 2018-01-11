'use strict';

angular.module('app').controller('MaterialTreeCtrl', function ($scope, options, hasChildren) {
    var currentOption = _.cloneDeep(options);
    $scope.hasChildren = hasChildren === true;
    // 用于接下来判断是单选还是多选  返回值会不同
    var isMultiple = _.isUndefined(currentOption.checkboxes) || currentOption.checkboxes === true;
    $scope.params = {};
    $scope.filter = function () {
        if ($scope.params.materialName || $scope.params.materialCode || $scope.params.materialGroupName || $scope.params.materialGroupCode) {
            $scope.treeViewOptions.treeView.dataSource.read($scope.params);
        } else {
            $scope.treeViewOptions.treeView.dataSource.read({id: '1'});
        }
    }
    $scope.treeViewOptions = {
        url: $scope.hasChildren ? '/api/baseInfo/material/getMaterialAndGroup' : '/api/baseInfo/material/getMaterialGroup',
        data: {id: '1'},
        schema: {
            type: "json",
            model: {
                id: "id",
                hasChildren: "group"
            },
            data: function (data) {
                if (data.result && data.result.list) {
                    _.each(data.result.list, function (item) {
                        if (item.group) {
                            item.imageUrl = './styles/img/treeView/folder.png';
                        } else {
                            item.imageUrl = './styles/img/treeView/file.png';
                        }
                    });
                    return data.result.list;
                } else {
                    return [];
                }
            }
        },
        template: '#: item.groupName #'
        + '<input class="groupId" type="hidden" value="#: item.id #"/>'
        + '<input class="groupName" type="hidden" value="#: item.groupName #"/>'
        + '<input class="groupCode" type="hidden" value="#: item.groupCode #"/>'
        + '<input class="parentGroupName" type="hidden" value="#: item.parentGroupName #"/>'
        + '<input class="parentGroupCode" type="hidden" value="#: item.parentGroupCode #"/>'
        + '<input class="standardUnitName" type="hidden" value="#: item.standardUnitName #"/>'
        + '<input class="isGroup" type="hidden" value="#: item.group #"/>'
        + '<input class="memo" type="hidden" value="#: item.memo #"/>'
    };

    // 如果是单选 则只有原料有选择框
    currentOption.check ? $scope.treeViewOptions.check = currentOption.check : '';
    isMultiple ? $scope.treeViewOptions.checkboxes = {
        checkChildren: true
    } : '';

    function setDefaultSel(items) {
        // 单独取出ID
        var currentArray = _.map(currentOption.modal, function (item) {
            return item.id;
        });
        _.each(items, function (item) {
            if (_.indexOf(currentArray, item.EmployeeId) >= 0) {
                item.checked = true;
            }
        });
    }

    // 获取选中的结果
    $scope.getSelMaterial = function () {
        if (isMultiple) {
            options.modal = [];
            checkedNodeIds($scope.treeViewOptions.dataSource.view(), options.modal);
            if (options.onlyLeaf && options.modal.length === 0) {
                swal('请选择原料', '', 'warning');
                return;
            }
        } else {
            var selectNode = $scope.treeViewOptions.treeView.select();
            if (options.onlyLeaf && selectNode.find('.isGroup').val() === 'true') {
                swal('请选择原料', '', 'warning');
                return;
            }
            options.modal = {
                id: selectNode.find('.groupId').val(),
                groupName: selectNode.find('.groupName').val(),
                groupCode: selectNode.find('.groupCode').val(),
                parentGroupCode: selectNode.find('.parentGroupCode').val(),
                parentGroupName: selectNode.find('.parentGroupName').val(),
                standardUnitName: selectNode.find('.standardUnitName').val(),
                memo: selectNode.find('.memo').val()
            };
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
            }
            if (item.checked) {
                if (options.onlyLeaf) {
                    if (!item.group) {
                        checkedNodes.push({id: item.id, name: item.groupName, code: item.groupCode, standardUnitId: item.standardUnitId, standardUnitName: item.standardUnitName, memo: item.memo});
                    }
                } else {
                    checkedNodes.push({id: item.id, name: item.groupName, code: item.groupCode, standardUnitId: item.standardUnitId, standardUnitName: item.standardUnitName, memo: item.memo});
                }
            }
        }
    }
});