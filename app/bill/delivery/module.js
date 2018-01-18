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
                title: '查询站点配送计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/delivery/views/planSearch.html',
                    controller: 'DeliveryPlanSearchCtrl'
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
                    templateUrl: 'app/bill/delivery/views/pickBySelf.html',
                    controller: 'DeliveryPickBySelfCtrl'
                }
            }
        })
        .state('app.bill.delivery.outStorageSearch', {
            url: '/bill/delivery/outStorageSearch',
            data: {
                title: '查询配送出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/delivery/views/outStorageSearch.html',
                    controller: 'DeliveryOutStorageSearchCtrl'
                }
            }
        })
});
