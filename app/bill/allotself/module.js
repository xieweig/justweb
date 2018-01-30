"use strict";


angular.module('app.bill.allotself', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.allotself', {
            abstract: true,
            data: {
                title: '其他调拨'
            }
        })
        .state('app.bill.allotself.allot', {
            url: '/bill/allotself/allot',
            data: {
                title: '添加其他调拨'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/allotself/views/transferBySelf.html',
                    controller: 'AllotSelfTransferBySelfCtrl'
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