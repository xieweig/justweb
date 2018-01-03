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
        .state('app.bill.procurement.look', {
            url: '/bill/procurement/look',
            data: {
                title: '查看进货入库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/procurement/views/look.html',
                    controller: 'ProcurementLookCtrl'
                }
            }
        })
        .state('app.bill.procurement.audit', {
            url: '/bill/procurement/audit',
            data: {
                title: '审核进货入库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/procurement/views/look.html',
                    controller: 'ProcurementAuditCtrl'
                }
            }
        })
        .state('app.bill.procurement.edit', {
            url: '/bill/procurement/edit',
            data: {
                title: '审核进货入库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/procurement/views/edit.html',
                    controller: 'ProcurementEditCtrl'
                }
            }
        })
        .state('app.bill.procurement.add', {
            url: '/bill/procurement/add',
            data: {
                title: '进货录单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/procurement/views/edit.html',
                    controller: 'ProcurementAddCtrl'
                }
            }
        })
});
