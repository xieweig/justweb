"use strict";


angular.module('app.bill.procurement', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.procurement', {
            abstract: true,
            data: {
                title: '运单跟踪'
            }
        })
        .state('app.bill.procurement.list', {
            url: '/bill/procurement/list',
            data: {
                title: '查询进货入库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/procurement/views/list.html',
                    controller: 'ProcurementListCtrl'
                }
            }
        })
        .state('app.bill.procurement.edit', {
            url: '/bill/procurement/list',
            data: {
                title: '查询进货入库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/procurement/views/list.html',
                    controller: 'ProcurementListCtrl'
                }
            }
        })
});
