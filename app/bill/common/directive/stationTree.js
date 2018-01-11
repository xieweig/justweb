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
            if (selectModal.initTip) {
                elm.html('<span class="tipsText">' + selectModal.initTip + '</span>');
            }
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
                options.sortable = selectModal.sortable;
                options.callback = function () {
                    selectModal.modal = options.modal;
                    if (elm.attr('tagName') !== 'INPUT') {
                        var text = '';
                        if (_.isArray(options.modal)) {
                            text = _.map(options.modal, function (item) {
                                return item.stationName || item.supplierName;
                            }).join();
                        } else {
                            text = options.modal.stationName || options.modal.supplierName;
                        }
                        elm.find('.tipsText').html(text);
                    }
                    if (_.isFunction(selectModal.callback)) {
                        selectModal.callback(options.modal);
                    }
                };
                if (!selectModal.isSupplier) {
                    $uibModal.open({
                        templateUrl: 'app/bill/common/modals/stationTree.html',
                        size: selectModal.sortable ? 'lg' : 'md',
                        controller: 'StationTreeCtrl',
                        resolve: {
                            options: options
                        }
                    });
                } else {
                    $uibModal.open({
                        templateUrl: 'app/bill/common/modals/stationAndSupplierTree.html',
                        size: selectModal.sortable ? 'lg' : 'md',
                        controller: 'StationAndSupplierTreeCtrl',
                        resolve: {
                            options: options
                        }
                    });
                }
            });
        }
    }
});