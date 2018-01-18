'use strict';

angular.module('app').directive('onlyNumber', function ($uibModal) {
    return {
        restrict: 'A',
        scope: {
            maxNumber: "@",
            minNumber: "@"
        },
        link: function (scope, element) {
            inputNumber(element, scope);
        }
    }
});