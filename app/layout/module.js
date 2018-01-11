"use strict";
angular.module('app.layout', ['ui.router']).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
            abstract: true,
            views: {
                root: {
                    templateUrl: 'app/layout/layout.tpl.html',
                    controller: 'LayoutCtrl'
                }
            },
            resolve: {
                largeArea: function (Common) {
                    return Common.getLargeArea('REGION');
                },
                city: function (Common) {
                    return Common.getCity();
                },
                station: function (Common) {
                    return Common.getStation();
                },
                scopeStation: function (Common) {
                    // return Common.getStation();
                    return Common.getScopeStation();
                },
                store: function (Common) {
                    return Common.getStore();
                }
            }
        });
    $urlRouterProvider.otherwise('/home');
});

