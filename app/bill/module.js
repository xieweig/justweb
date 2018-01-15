"use strict";


angular.module('app.bill', [
    'ui.router',
    'app.bill.plan',
    'app.bill.trace',
    'app.bill.restock',
    'app.bill.returned',
    'app.bill.procurement',
    'app.bill.delivery',
    'app.bill.adjust'
]).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill', {
            abstract: true,
            data: {
                title: '单据'
            }
        })
});
