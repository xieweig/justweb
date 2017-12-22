'use strict';

angular.module('SmartAdmin.Expand').directive('datepicker', function ($timeout, MainFactory) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            format: '@',
            maxDate: '@',
            minDate: '@'
        },
        link: function (scope, element, attr, ngModel) {
            element.css('backgroundColor', '#fff').prop('readonly', true);
            element.val(ngModel.$viewValue);

            function onpicking(dp) {
                var date = dp.cal.getNewDateStr();
                scope.$apply(function () {
                    ngModel.$setViewValue(date);
                });
            }

            element.on({
                click: function () {
                    var option = {
                        el: this,
                        onpicking: onpicking,
                        dateFmt: (scope.format || 'yyyy-MM-dd HH:mm:ss'),
                        enableKeyboard: false,
                        enableInputMask: false
                    };
                    scope.maxDate ? option.maxDate = scope.maxDate : '';
                    if (scope.minDate) {
                        if (scope.minDate === 'now') {
                            option.minDate = new Date().format('yyyy-MM-dd');
                        } else {
                            option.minDate = scope.minDate;
                        }
                    }
                    WdatePicker(option)
                },
                blur: function () {
                    var _this = this;
                    scope.$apply(function () {
                        ngModel.$setViewValue(_this.value);
                    });
                }
            });
        }
    }
});