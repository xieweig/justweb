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
        })
        .state('app.bill.adjust.outStorageList', {
            url: '/bill/adjust/outStorageList',
            data: {
                title: '查询调剂出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/adjust/views/outStorageList.html',
                    controller: 'AdjustOutStorageListCtrl'
                }
            }
        })
        .state('app.bill.adjust.inStorageList', {
            url: '/bill/adjust/inStorageList',
            data: {
                title: '调剂入库单查询'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/adjust/views/inStorageList.html',
                    controller: 'AdjustInStorageListCtrl'
                }
            }
        })
        .state('app.bill.adjust.transferList', {
            url: '/bill/adjust/transferList',
            data: {
                title: '调剂调拨单查询'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/adjust/views/transferList.html',
                    controller: 'AdjustTransferListCtrl'
                }
            }
        });
});