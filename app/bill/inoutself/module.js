"use strict";


angular.module('app.bill.inoutself', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.inoutself', {
            abstract: true,
            data: {
                title: '其他出入库'
            }
        })
        .state('app.bill.inoutself.pick', {
            url: '/bill/inoutself/pick',
            data: {
                title: '查询站点退库计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/inoutself/views/pickBySelf.html',
                    controller: 'inOutSelfPickBySelfCtrl'
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
        .state('app.bill.inoutself.outStorageList', {
            url: '/bill/inoutself/outStorageList',
            data: {
                title: '查询其他出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/inoutself/views/outStorageSearch.html',
                    controller: 'InOutSelfOutStorageSearchCtrl'
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
        .state('app.bill.inoutself.inStorageList', {
            url: '/bill/inoutself/inStorageList',
            data: {
                title: '查询其他入库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/inoutself/views/inStorageSearch.html',
                    controller: 'InOutSelfInStorageSearchCtrl'
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
        .state('app.bill.inoutself.transferList', {
            url: '/bill/inoutself/transferList',
            data: {
                title: '查询其他调拨单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/inoutself/views/transferSearch.html',
                    controller: 'InOutSelfTransferSearchCtrl'
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