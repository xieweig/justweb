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
        .state('app.bill.delivery.outStorageList', {
            url: '/bill/delivery/outStorageList',
            data: {
                title: '查询配送出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/delivery/views/outStorageSearch.html',
                    controller: 'DeliveryOutStorageSearchCtrl'
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
        .state('app.bill.delivery.inStorageList', {
            url: '/bill/delivery/inStorageList',
            data: {
                title: '查询配送入库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/delivery/views/inStorageSearch.html',
                    controller: 'DeliveryInStorageSearchCtrl'
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
        .state('app.bill.delivery.transferList', {
            url: '/bill/delivery/transferList',
            data: {
                title: '查询配送调拨单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/delivery/views/transferSearch.html',
                    controller: 'DeliveryTransferSearchCtrl'
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
