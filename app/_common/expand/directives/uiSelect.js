'use strict';

angular.module('SmartAdmin.Expand').directive('uiSelect', function ($timeout, MainFactory) {
    return {
        restrict: 'A',
        // replace: true,
        template: '{{placeholder}}',
        scope: {
            placeholder: '@'
        },
        link: function (scope, elm) {
            elm.addClass('ui-select');
            !scope.placeholder ? scope.placeholder = '请选择' : scope.placeholder;
        }
    }
});