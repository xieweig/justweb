"use strict";


angular.module('app.bill.plan', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.plan', {
            abstract: true,
            data: {
                title: '货物'
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
            }
        });
});
