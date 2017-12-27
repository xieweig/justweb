'use strict';
/**
 * single:只选择单个
 * onlyLeaf:只能选择叶子级
 * initTip:最开始的提示语
 * type:类型 material product
 * hasChildren:请求的地址是否包含产品或者原料
 */
angular.module('app').directive('selectTree', function ($uibModal) {
    return {
        restrict: 'A',
        scope: {
            selectModal: '='
        },
        link: function (scope, elm) {
            if (!scope.selectModal) {
                return;
            }
            var selectModal = scope.selectModal;
            // 初始化参数
            if (selectModal.single !== true) {
                selectModal.single = false;
            }
            if (selectModal.button !== true) {
                elm.addClass('ui-select').removeAttr('select-material data-select-material');
            }
            elm.html(selectModal.initTip);
            elm.click(function () {
                var options = {};
                if (selectModal.single) {
                    options.checkboxes = false;
                } else {
                    options.checkboxes = true;
                }
                options.onlyLeaf = selectModal.onlyLeaf;
                options.callback = function () {
                    selectModal.modal = options.modal;
                    if (elm.attr('tagName') !== 'INPUT') {
                        var text = '';
                        if (_.isArray(options.modal)) {
                            text = _.map(options.modal, function (item) {
                                return item.groupName || item.name;
                            }).join();
                        } else {
                            text = options.modal.groupName || options.modal.name;
                        }
                        elm.html(text);
                    }
                    if (_.isFunction(selectModal.callback)) {
                        selectModal.callback(options.modal);
                    }
                };
                $uibModal.open({
                    templateUrl: 'app/baseInfo/common/modals/' + (selectModal.type === 'material' ? 'materialTree' : 'productTree') + '.html',
                    size: 'md',
                    controller: (selectModal.type === 'material' ? 'MaterialTreeCtrl' : 'ProductTreeCtrl'),
                    resolve: {
                        options: options,
                        hasChildren: selectModal.hasChildren === true
                    }
                });
            });
        }
    }
});