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
            params: {
                type: 'look'
            },
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
            params: {
                type: 'audit'
            },
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
            params: {
                type: 'edit'
            },
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
});
