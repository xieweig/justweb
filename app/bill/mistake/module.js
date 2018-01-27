"use strict";


angular.module('app.bill.mistake', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.mistake', {
            abstract: true,
            data: {
                title: '配送'
            }
        })
        .state('app.bill.mistake.overflowList', {
            url: '/bill/mistake/overflowList',
            params: {
                typeName: '报溢',
                type: 'overflow'
            },
            data: {
                title: '查询报溢单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/mistake/views/list.html',
                    controller: 'MistakeListCtrl'
                }
            },
            resolve: {
                cargoUnit: function (Common) {
                    return Common.getConfigure('CARGO_UNIT');
                }
            }
        })
        .state('app.bill.mistake.overflowAdd', {
            url: '/bill/mistake/overflowAdd',
            params: {
                typeName: '报溢',
                type: 'overflow'
            },
            data: {
                title: '添加报溢单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/mistake/views/add.html',
                    controller: 'MistakeAddCtrl'
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
        .state('app.bill.mistake.lossList', {
            url: '/bill/mistake/lossList',
            params: {
                typeName: '报损',
                type: 'loss'
            },
            data: {
                title: '查询报损单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/mistake/views/list.html',
                    controller: 'MistakeListCtrl'
                }
            },
            resolve: {
                cargoUnit: function (Common) {
                    return Common.getConfigure('CARGO_UNIT');
                }
            }
        })
        .state('app.bill.mistake.lossAdd', {
            url: '/bill/mistake/lossAdd',
            params: {
                typeName: '报损',
                type: 'loss'
            },
            data: {
                title: '添加报损单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/mistake/views/add.html',
                    controller: 'MistakeAddCtrl'
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
        .state('app.bill.mistake.adyMistakeList', {
            url: '/bill/mistake/adyMistakeList',
            params: {
                typeName: '误差',
                type: 'dayMistake'
            },
            data: {
                title: '查询日常误差单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/mistake/views/list.html',
                    controller: 'MistakeListCtrl'
                }
            },
            resolve: {
                cargoUnit: function (Common) {
                    return Common.getConfigure('CARGO_UNIT');
                }
            }
        })
        .state('app.bill.mistake.adyMistakeAdd', {
            url: '/bill/mistake/adyMistakeAdd',
            params: {
                typeName: '误差',
                type: 'dayMistake'
            },
            data: {
                title: '添加日常误差'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/mistake/views/add.html',
                    controller: 'MistakeAddCtrl'
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
        .state('app.bill.mistake.list', {
            url: '/bill/mistake/list',
            data: {
                title: '查询流转误差单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/mistake/views/turnoverList.html',
                    controller: 'TurnoverListCtrl'
                }
            }
        });
});
