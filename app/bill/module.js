"use strict";


angular.module('app.bill', [
    'ui.router',
    'app.bill.plan',
    'app.bill.procurement',
    'app.bill.trace'
]).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill', {
            abstract: true,
            data: {
                title: '单据'
            }
        })
});
