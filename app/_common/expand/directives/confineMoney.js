'use strict';

angular.module('app').directive('confineMoney', function ($uibModal) {
    return {
        restrict: 'A',
        scope: {
            ngModel: '='
        },
        link: function (scope, elm, attr) {
            inputDecimal(elm, scope);
        }
    }
});