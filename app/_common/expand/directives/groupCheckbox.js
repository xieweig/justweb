'use strict'

angular.module('SmartAdmin.Expand').directive('groupCheckbox', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {
            element.hide()
                .addClass('disable-table-cell')
                .removeAttr('group-checkbox data-group-checkbox');
            $timeout(function () {

            });
        }
    }
});