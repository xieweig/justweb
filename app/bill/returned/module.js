"use strict";

angular.module('app.bill.returned', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.returned', {
            abstract: true,
            data: {
                title: '退货'
            }
        })
        .state('app.bill.returned.planSearch', {
            url: '/bill/returned/plan/search',
            data: {
                title: '查询站点退货计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/returned/views/planSearch.html',
                    controller: 'ReturnedPlanSearchCtrl'
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
        .state('app.bill.returned.selfPick', {
            url: '/bill/returned/station/selfpick',
            data: {
                title: '站点退货拣货'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/returned/views/pickBySelf.html',
                    controller: 'ReturnedPickBySelfCtrl'
                }
            }
        })
        .state('app.bill.returned.stationPick', {
            url: '/bill/returned/station/pick/:pickId',
            data: {
                title: '站点退货计划拣货'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/returned/views/pickByPlan.html',
                    controller: 'ReturnedPickByPlanCtrl'
                }
            }
        })
        .state('app.bill.returned.outSearch', {
            url: '/bill/returned/out/search',
            data: {
                title: '查询退货出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/returned/views/outStorageSearch.html',
                    controller: 'ReturnedOutStorageSearchCtrl'
                }
            }
        })
});