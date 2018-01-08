'use strict';

angular.module('app').controller('SupplierTreeCtrl', function ($scope, options, hasChildren) {
    var currentOption = _.cloneDeep(options);
    $scope.hasChildren = hasChildren === true;
    // 用于接下来判断是单选还是多选  返回值会不同
    var isMultiple = _.isUndefined(currentOption.checkboxes) || currentOption.checkboxes === true;
    $scope.treeViewOptions = {
        url: COMMON_URL.baseInfo + '/api/v1/baseInfo/supplier/findBySupplierName',
        data: { supplierName: '' },
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

    $scope.params = {};
    $scope.filterSupplier = function () {
        if ($scope.params.supplierName) {
            $scope.treeViewOptions.treeView.dataSource.read($scope.params);
        } else {
            $scope.treeViewOptions.treeView.dataSource.read({ supplierName: '' });
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
                supplierName: selectNode.find('.supplierName').val(),
                supplierCode: selectNode.find('.supplierCode').val(),
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
                        checkedNodes.push(getResult(item));
                    }
                } else {
                    checkedNodes.push(getResult(item));
                }
            }
        }
    }

    function getResult(item) {
        return { id: item.id, groupCode: item.groupCode, groupName: item.groupName, parentGroupCode: item.parentGroupCode, parentGroupName: item.parentGroupName, type: item.groupType, price: item.price, memo: item.memo };
    }
});