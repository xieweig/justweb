'use strict';

angular.module('app').directive('textarea', function ($uibModal) {
    return {
        restrict: 'E',
        compile: function (element) {
            var textarea = element[0];
            if (textarea.maxLength === -1) {
                textarea.maxLength = 255;
            }
        }
    }
});