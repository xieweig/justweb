"use strict";


angular.module('app.bill.restock', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.restock', {
            abstract: true,
            data: {
                title: '退库'
            }
        })
        .state('app.bill.restock.planList', {
            url: '/bill/restock/planList',
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
        .state('app.bill.restock.pick', {
            url: '/bill/restock/station/pick',
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
        .state('app.bill.restock.outStorageList', {
            url: '/bill/restock/outStorageList',
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
        .state('app.bill.restock.inStorageList', {
            url: '/bill/restock/inStorageList',
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
        .state('app.bill.restock.transferList', {
            url: '/bill/restock/transferList',
            data: {
                title: '查询退库调拨单'
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
