"use strict";


angular.module('app.bill.return', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.return', {
            abstract: true,
            data: {
                title: '退库'
            }
        })
        .state('app.bill.return.planSearch', {
            url: '/bill/return/plan/search',
            data: {
                title: '查询站点退库计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/planSearch.html',
                    controller: 'PlanSearchCtrl'
                }
            }
        })
        .state('app.bill.return.planView', {
            url: '/bill/return/plan/view',
            data: {
                title: '查看站点退库计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/planView.html',
                    controller: 'PlanViewCtrl'
                }
            }
        })
        .state('app.bill.return.StationPick', {
            url: '/bill/return/station/selfpick',
            data: {
                title: '站点退库拣货'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/stationPick.html',
                    controller: 'stationPickCtrl'
                }
            }
        })
        .state('app.bill.return.StationPickByC', {
            url: '/bill/return/station/pick',
            data: {
                title: '查看站点退库计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/returnStationPickByC.html',
                    controller: 'returnPlanViewCtrl'
                }
            }
        })
        .state('app.bill.return.outSearch', {
            url: '/bill/return/out/search',
            data: {
                title: '查询退库出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/outSearch.html',
                    controller: 'outSearchCtrl'
                }
            }
        })
        .state('app.bill.return.outView', {
            url: '/bill/return/out/view',
            data: {
                title: '查看退库出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/outView.html',
                    controller: 'outViewCtrl'
                }
            }
        })
        .state('app.bill.return.outEdit', {
            url: '/bill/return/out/edit',
            data: {
                title: '修改退库出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/outEdit.html',
                    controller: 'outEditCtrl'
                }
            }
        })
        .state('app.bill.return.outCheck', {
            url: '/bill/return/out/check',
            data: {
                title: '审核退库出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/outCheck.html',
                    controller: 'outCheckCtrl'
                }
            }
        })
        .state('app.bill.return.inSearch', {
            url: '/bill/return/in/search',
            data: {
                title: '查询退库入库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/inSearch.html',
                    controller: 'inSearchCtrl'
                }
            }
        })
        .state('app.bill.return.inView', {
            url: '/bill/return/in/view',
            data: {
                title: '查看退库出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/inView.html',
                    controller: 'inViewCtrl'
                }
            }
        })
        .state('app.bill.return.inAction', {
            url: '/bill/return/in/action',
            data: {
                title: '退库到货调拨'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/inAction.html',
                    controller: 'inActionCtrl'
                }
            }
        })
        .state('app.bill.return.inActionSearch', {
            url: '/bill/return/in/asearch',
            data: {
                title: '查询退库调拨单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/inActionSearch.html',
                    controller: 'inActionSearchCtrl'
                }
            }
        })
        .state('app.bill.return.inActionView', {
            url: '/bill/return/in/aview',
            data: {
                title: '查看退库调拨单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/return/views/inActionView.html',
                    controller: 'inActionViewCtrl'
                }
            }
        });
});
