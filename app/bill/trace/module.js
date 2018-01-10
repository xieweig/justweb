"use strict";


angular.module('app.bill.trace', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.trace', {
            abstract: true,
            data: {
                title: '运单跟踪'
            }
        })
        .state('app.bill.trace.list', {
            url: '/bill/trace/list',
            data: {
                title: '查询运单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/trace/views/list.html',
                    controller: 'TraceListCtrl'
                }
            }
        })
        .state('app.bill.trace.add', {
            url: '/bill/trace/add',
            data: {
                title: '添加运单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/trace/views/add.html',
                    controller: 'TraceAddCtrl'
                }
            },
            resolve: {
                params: function () {
                    return {
                        billCode: '',
                        isRead: false
                    };
                }
            }
        });
});
