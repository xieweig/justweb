'use strict';

angular.module('app').directive('input', function ($uibModal) {
    return {
        restrict: 'E',
        compile: function (element) {
            var input = element[0];
            if (input.maxLength === -1 && input.type === 'text') {
                input.maxLength = 255;
            }
        }
    }
});