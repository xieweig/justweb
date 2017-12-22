'use strict';

angular.module('app').directive('confineMoney', function ($uibModal) {
    return {
        restrict: 'A',
        scope: {
            ngModel: '='
        },
        link: function (scope, elm, attr) {
            elm.blur(function () {
                var _this = this;
                var value = parseFloat(this.value);
                value = value < 0 ? -value : value;
                scope.$apply(function () {
                    scope.ngModel = value === value ? value : '';
                });
            });
        }
    }
});