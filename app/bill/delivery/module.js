"use strict";


angular.module('app.bill.delivery', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.delivery', {
            abstract: true,
            data: {
                title: '配送'
            }
        })
        .state('app.bill.delivery.planList', {
            url: '/bill/delivery/planList',
            data: {
                title: '添加运单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/delivery/views/list.html',
                    controller: 'DeliveryListCtrl'
                }
            }
        })
        .state('app.bill.delivery.pick', {
            url: '/bill/delivery/pick',
            data: {
                title: '站点配送拣货'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/delivery/views/pick.html',
                    controller: 'DeliveryPickCtrl'
                }
            }
        });
});
