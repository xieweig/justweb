'use strict'

angular.module('SmartAdmin.Forms').directive('smartSelect2', function (lazyScript) {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {
            element.hide().removeAttr('smart-select2 data-smart-select2');
            var options = {};
            attributes.selectSearch === 'on' ? '' : options.minimumResultsForSearch = -1;
            lazyScript.register('build/vendor.ui.js').then(function () {
                element.show().select2(options);
            })
        }
    }
});