'use strict'

angular.module('SmartAdmin.Expand').directive('multipleSelect', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            multipleModel: '='
        },
        link: function (scope, element, attributes) {
            element.hide()
                .attr('multiple', true)
                .removeAttr('multiple-select2 data-multiple-select2');
            $timeout(function () {
                element.multipleSelect({
                    filter: true,
                    placeholder: "请选择",
                    onClick: function () {
                        scope.multipleModel = element.multipleSelect('getSelects');
                    }
                });
            });
        }
    }
});