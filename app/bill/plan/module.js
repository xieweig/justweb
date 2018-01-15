"use strict";


angular.module('app.bill.plan', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.plan', {
            abstract: true,
            data: {
                title: '总部计划中心'
            }
        })
        .state('app.bill.plan.add', {
            url: '/bill/plan/add',
            data: {
                title: '添加总部计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/plan/views/add.html',
                    controller: 'PlanAddCtrl'
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
        .state('app.bill.plan.edit', {
            url: '/bill/plan/edit',
            params: {
                billCode: ''
            },
            data: {
                title: '查询总部计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/plan/views/add.html',
                    controller: 'PlanAddCtrl'
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
        .state('app.bill.plan.list', {
            url: '/bill/plan/list',
            data: {
                title: '查询总部计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/plan/views/list.html',
                    controller: 'PlanListCtrl'
                }
            }
        })
});
