"use strict";


angular.module('app.bill.adjust', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.adjust', {
            abstract: true,
            data: {
                title: '配送'
            }
        })
        .state('app.bill.adjust.planList', {
            url: '/bill/adjust/planList',
            data: {
                title: '添加运单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/adjust/views/list.html',
                    controller: 'AdjustListCtrl'
                }
            }
        })
        .state('app.bill.adjust.pick', {
            url: '/bill/adjust/pick',
            data: {
                title: '站点配送拣货'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/adjust/views/pick.html',
                    controller: 'AdjustPickCtrl'
                }
            }
        });
});
