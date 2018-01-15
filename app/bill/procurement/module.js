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
            },
            resolve: {
                cargoUnit: function (Common) {
                    return Common.getConfigure('CARGO_UNIT');
                },
                materialUnit: function (Common) {
                    return Common.getConfigure('MATERIAL_UNIT');
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
                    templateUrl: 'app/bill/procurement/views/add.html',
                    controller: 'ProcurementEditCtrl'
                }
            },
            resolve: {
                params: function () {
                    return {
                        type: 'add',
                        purchaseBill: {}
                    };
                },
                cargoUnit: function (Common) {
                    return Common.getConfigure('CARGO_UNIT');
                },
                materialUnit: function (Common) {
                    return Common.getConfigure('MATERIAL_UNIT');
                }
            }
        })
});
