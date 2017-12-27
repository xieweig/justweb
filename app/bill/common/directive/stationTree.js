'use strict';

angular.module('app').directive('stationTree', function ($uibModal) {
    return {
        restrict: 'A',
        template: '<span class="tipsText">{{text}}</span>',
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
                options.onlyCity = selectModal.onlyCity;
                options.modal = selectModal.modal;
                options.type = selectModal.type;
                options.callback = function () {
                    selectModal.modal = options.modal;
                    if (elm.attr('tagName') !== 'INPUT') {
                        var text = '';
                        if (_.isArray(options.modal)) {
                            text = _.map(options.modal, function (item) {
                                return item.name;
                            }).join();
                        } else {
                            text = options.modal.name;
                        }
                        elm.find('.tipsText').html(text);
                    }
                    if (_.isFunction(selectModal.callback)) {
                        selectModal.callback(options.modal);
                    }
                };
                $uibModal.open({
                    templateUrl: 'app/bill/common/modals/stationTree.html',
                    size: 'md',
                    controller: 'StationTreeCtrl',
                    resolve: {
                        options: options
                    }
                });
            });
        }
    }
});