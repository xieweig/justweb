'use strict'

angular.module('SmartAdmin.Expand').directive('multipleSelect', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {
            element.hide()
                .attr('multiple', true)
                .removeAttr('multiple-select2 data-multiple-select2')
                .multipleSelect({
                    filter: true,
                    placeholder: "请选择"
                });
        }
    }
});