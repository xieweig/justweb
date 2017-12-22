'use strict';

angular.module('app').directive('onlyNumber', function ($uibModal) {
    return {
        restrict: 'A',
        scope: {
            maxNumber: "@",
            minNumber: "@"
        },
        link: function (scope, element) {
            element.on({
                compositionstart: function () {
                    var $this = $(this);
                    $this.unbind('input')
                },
                compositionend: function () {
                    inputFunction();
                    $(this).on('input', inputFunction);
                },
                input: inputFunction
            });

            function inputFunction() {
                var val = element.val();
                var reg = /\d+/g;
                var result = reg.exec(val);
                if (!result) {
                    element.val('');
                } else {
                    val = parseInt(result[0]);
                    var maxNumber = parseInt(scope.maxNumber);
                    var minNumber = parseInt(scope.minNumber);
                    if (maxNumber && maxNumber < val) {
                        val = maxNumber
                    }
                    if (minNumber && minNumber > val) {
                        val = minNumber
                    }
                    element.val(val);
                }
            }
        }
    }
});