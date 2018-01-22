"use strict";


angular.module('app.bill.others', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.others', {
            abstract: true,
            data: {
                title: '其他出入库'
            }
        })
        .state('app.bill.others.pick', {
            url: '/bill/others/pick',
            data: {
                title: '查询站点退库计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/others/views/pickBySelf.html',
                    controller: 'OthersPickBySelfCtrl'
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