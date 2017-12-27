'use strict';

angular.module('app').controller('ProductTreeCtrl', function ($scope, options, hasChildren) {
    var currentOption = _.cloneDeep(options);
    $scope.hasChildren = hasChildren === true;
    // 用于接下来判断是单选还是多选  返回值会不同
    var isMultiple = _.isUndefined(currentOption.checkboxes) || currentOption.checkboxes === true;
    $scope.treeViewOptions = {
        url: hasChildren === false ? '/api/baseInfo/productTypes/findProductTypeByProductTypeId' : '/api/baseInfo/productTypes/findProductGroupByProductTypeId',
        data: { id: '1' },
        schema: {
            type: "json",
            model: {
                id: "id",
                hasChildren: "group"
            },
            data: function (data) {
                if (data.result && data.result.content) {
                    _.each(data.result.content, function (item) {
                        if (item.group) {
                            item.imageUrl = './styles/img/treeView/folder.png';
                        } else {
                            item.imageUrl = './styles/img/treeView/file.png';
                        }
                        item.groupTypeName = getTextByKey($scope.productBaseType, item.groupType)
                    });
                    return data.result.content;
                } else {
                    return [];
                }
            }
        },
        template: '#: item.groupName+(item.groupTypeName?"["+item.groupTypeName+"]":"") #'
            + '<input class="groupId" type="hidden" value="#: item.id #"/>'
            + '<input class="groupName" type="hidden" value="#: item.groupName #"/>'
            + '<input class="groupCode" type="hidden" value="#: item.groupCode #"/>'
            + '<input class="groupCode" type="hidden" value="#: item.parentGroupName #"/>'
            + '<input class="groupCode" type="hidden" value="#: item.parentGroupCode #"/>'
            + '<input class="isGroup" type="hidden" value="#: item.group #"/>'
            + '<input class="price" type="hidden" value="#: item.price #"/>'
            + '<input class="memo" type="hidden" value="#: item.memo #"/>'
    };

    $scope.params = {};
    $scope.filterProduct = function () {
        if ($scope.params.productName || $scope.params.productCode || $scope.params.productTypeName || $scope.params.productTypeCode) {
            $scope.treeViewOptions.treeView.dataSource.read($scope.params);
        } else {
            $scope.treeViewOptions.treeView.dataSource.read({ id: '1' });
        }
    }

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
    $scope.getSelProduct = function () {
        if (isMultiple) {
            options.modal = [];
            checkedNodeIds($scope.treeViewOptions.dataSource.view(), options.modal);
            if (options.onlyLeaf && options.modal.length === 0) {
                swal('请选择产品', '', 'warning');
                return;
            }
        } else {
            var selectNode = $scope.treeViewOptions.treeView.select();
            if (options.onlyLeaf && selectNode.find('.isGroup').val() === 'true') {
                swal('请选择产品', '', 'warning');
                return;
            }
            options.modal = {
                id: selectNode.find('.groupId').val(),
                groupName: selectNode.find('.groupName').val(),
                groupCode: selectNode.find('.groupCode').val(),
                parentGroupCode: selectNode.find('.parentGroupCode').val(),
                memo: selectNode.find('.memo').val(),
                parentGroupName: selectNode.find('.parentGroupName').val()
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
                        checkedNodes.push({ id: item.id, groupCode: item.groupCode, groupName: item.groupName, parentGroupCode: item.parentGroupCode, parentGroupName: item.parentGroupName, type: item.groupType, price: item.price, memo: item.memo });
                    }
                } else {
                    checkedNodes.push({ id: item.id, groupCode: item.groupCode, groupName: item.groupName, parentGroupCode: item.parentGroupCode, parentGroupName: item.parentGroupName, type: item.groupType, price: item.price, memo: item.memo });
                }
            }
        }
    }
});