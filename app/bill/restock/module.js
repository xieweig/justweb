"use strict";


angular.module('app.bill.restock', ['ui.router']).config(function ($stateProvider) {
    $stateProvider
        .state('app.bill.restock', {
            abstract: true,
            data: {
                title: '退库'
            }
        })
        .state('app.bill.restock.planSearch', {
            url: '/bill/restock/plan/search',
            data: {
                title: '查询站点退库计划'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/restock/views/plan/Search.html',
                    controller: 'PlanSearchCtrl'
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
        .state('app.bill.restock.selfPick', {
            url: '/bill/restock/station/selfpick',
            data: {
                title: '站点退库拣货'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/restock/views/pick/self.html',
                    controller: 'selfPickCtrl'
                }
            },
            resolve: {
                station: function (Common) {
                    var options = {type: 'LOGISTICS'};
                    return Common.getStation(options);
                },
                cargoUnit: function (Common) {
                    return Common.getConfigure('CARGO_UNIT');
                },
                materialUnit: function (Common) {
                    return Common.getConfigure('MATERIAL_UNIT');
                }
            }
        })
        .state('app.bill.restock.stationPick', {
            url: '/bill/restock/station/pick/:pickId',
            data: {
                title: '站点退库计划拣货'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/restock/views/pick/station.html',
                    controller: 'stationPickCtrl'
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
        .state('app.bill.restock.outSearch', {
            url: '/bill/restock/out/search',
            data: {
                title: '查询退库出库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/restock/views/out/Search.html',
                    controller: 'outSearchCtrl'
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
        // .state('app.bill.restock.outView', {
        //     url: '/bill/restock/out/view/:outId',
        //     data: {
        //         title: '查看退库出库单'
        //     },
        //     views: {
        //         "content@app": {
        //             templateUrl: 'app/bill/restock/views/out/View.html',
        //             controller: 'outViewCtrl'
        //         }
        //     }
        // })
        // .state('app.bill.restock.outEdit', {
        //     url: '/bill/restock/out/edit/:outId',
        //     data: {
        //         title: '修改退库出库单'
        //     },
        //     views: {
        //         "content@app": {
        //             templateUrl: 'app/bill/restock/views/out/Edit.html',
        //             controller: 'outEditCtrl'
        //         }
        //     }
        // })
        // .state('app.bill.restock.outCheck', {
        //     url: '/bill/restock/out/check/:outId',
        //     data: {
        //         title: '审核退库出库单'
        //     },
        //     views: {
        //         "content@app": {
        //             templateUrl: 'app/bill/restock/views/out/Check.html',
        //             controller: 'outCheckCtrl'
        //         }
        //     }
        // })
        .state('app.bill.restock.inSearch', {
            url: '/bill/restock/in/search',
            data: {
                title: '查询退库入库单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/restock/views/inStorageSearch.html',
                    controller: 'RestockInStorageSearchCtrl'
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
        .state('app.bill.restock.transfer', {
            url: '/bill/restock/transfer/search',
            data: {
                title: '查询调剂调拨单'
            },
            views: {
                "content@app": {
                    templateUrl: 'app/bill/restock/views/transferSearch.html',
                    controller: 'RestockTransferSearchCtrl'
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
