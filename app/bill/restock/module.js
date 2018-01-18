"use strict";


angular.module('app.bill.restock', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.restock', {
            abstract: true,
            data: {
                title: '退库'
            }
        })
        .state('app.bill.restock.planSearch', {
            url: '/bill/restock/plan/search',
            data: {
                title: '查询站点退库计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/restock/views/planSearch.html',
                    controller: 'RestockPlanSearchCtrl'
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
        .state('app.bill.restock.selfPick', {
            url: '/bill/restock/station/selfpick',
            data: {
                title: '站点退库拣货'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/restock/views/pickBySelf.html',
                    controller: 'RestockPickBySelfCtrl'
                }
            },
            resolve: {
                station: function (Common) {
                    return Common.getStation();
                },
                cargoUnit: function (Common) {
                    return Common.getConfigure('CARGO_UNIT');
                },
                materialUnit: function (Common) {
                    return Common.getConfigure('MATERIAL_UNIT');
                }
            }
        })
        .state('app.bill.restock.outSearch', {
            url: '/bill/restock/out/search',
            data: {
                title: '查询退库出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/restock/views/outStorageSearch.html',
                    controller: 'RestockOutSearchCtrl'
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
        .state('app.bill.restock.inSearch', {
            url: '/bill/restock/in/search',
            data: {
                title: '查询退库入库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/restock/views/inStorageSearch.html',
                    controller: 'RestockInStorageSearchCtrl'
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
        .state('app.bill.restock.transfer', {
            url: '/bill/restock/transfer/search',
            data: {
                title: '查询调剂调拨单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/restock/views/transferSearch.html',
                    controller: 'RestockTransferSearchCtrl'
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

});
