'use strict';

angular.module('app').directive('confineMoney', function ($uibModal) {
    return {
        restrict: 'A',
        scope: {
            ngModel: '='
        },
        link: function (scope, elm, attr) {
            elm.blur(function () {
                var value = parseFloat(this.value);
                value = value < 0 ? -value : value;
                value = value > 9999999.99 ? 0 : value;
                scope.$apply(function () {
                    scope.ngModel = value === value ? value : '';
                });
            });
        }
    }
});