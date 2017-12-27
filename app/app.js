'use strict';

/**
 * @ngdoc overview
 * @name app [smartadminApp]
 * @description
 * # app [smartadminApp]
 *
 * Main module of the application.
 */

var app = angular.module('app', [
    'ngSanitize',
    'ngAnimate',
    'restangular',
    'ui.router',
    'ui.bootstrap',

    // Smartadmin Angular Common Module
    'SmartAdmin',

    // App
    'app.auth',
    'app.layout',
    'app.home',
    'app.bill'
]).config(function ($provide, $httpProvider, RestangularProvider, $uibModalProvider) {
    $uibModalProvider.options.keyboard = false;
    $uibModalProvider.options.backdrop = 'static';

    // Intercept http calls.
    $provide.factory('ErrorHttpInterceptor', function ($q) {
        var errorCounter = 0;

        function notifyError(rejection) {
            console.log(rejection);
            $.bigBox({
                title: rejection.status + ' ' + rejection.statusText,
                content: (rejection.data && rejection.data.message) || '',
                color: "#C46A69",
                icon: "fa fa-warning shake animated",
                number: ++errorCounter,
                timeout: 6000
            });
        }

        return {
            request: function (config) {
                showLoadingModal();
                var headers = {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                    "Access-Control-Allow-Credentials": "true"
                };
                config.headers = _.extend(headers, config.headers);
                return config;
            },
            // On request failure
            requestError: function (rejection) {
                hideLoadingModal();
                // show notification
                notifyError(rejection);

                // Return the promise rejection.
                return $q.reject(rejection);
            },
            response: function (res) {
                hideLoadingModal();
                return res;
            },
            // On response failure
            responseError: function (rejection) {
                hideLoadingModal();
                // show notification
                notifyError(rejection);
                // Return the promise rejection.
                return $q.reject(rejection);
            }
        };
    });

    // Add the interceptor to the $httpProvider.
    $httpProvider.interceptors.push('ErrorHttpInterceptor');

    RestangularProvider.setBaseUrl(location.pathname.replace(/[^\/]+?$/, ''));
}).constant('APP_CONFIG', window.appConfig).run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;


    $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {

    });
    $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {
        showLoadingModal();
    });
    $rootScope.$on('$viewContentLoaded', function (evt) {
        hideLoadingModal();
    });
});

app.factory('MainFactory', function () {
    return {
        host: 'http://192.168.21.56:15001',
        downloadUrl: 'http://192.168.21.141:2222/report/',
        exportExcelHost: 'http://192.168.21.141:15005',
        system: 'baseInfo',
        timeout: 10000,
        headers: function (otherHeader, dataType) {
            var headers = {
                'Content-Type': dataType && dataType === 'text' ? 'application/x-www-form-urlencoded' : 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Credentials": "true"
            };
            if (otherHeader) {
                _.extend(headers, otherHeader);
            }
            return headers;
        }
    };
});

// 封装接口
app.factory("ApiService", function ($http, $q, MainFactory) {
    // hasHost:表示url中是否包含host,不包含会增加默认host
    return {
        post: function (url, data, options) {
            options = options || {};
            url = !options.hasHost ? MainFactory.host + url : url;
            var headers = MainFactory.headers(options.headers, options.dataType);
            var deferred = $q.defer();
            $http({
                url: url,
                method: "POST",
                headers: headers,
                data: data,
                timeout: MainFactory.timeout
            }).then(function (response) {
                deferred.resolve(response.data);
            }, function (response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        get: function (url, options) {
            options = options || {};
            url = !options.hasHost ? MainFactory.host + url : url;
            options = options || {};
            var deferred = $q.defer();
            $http({
                url: url,
                method: "GET",
                headers: MainFactory.headers(options.headers),
                timeout: MainFactory.timeout
            }).then(function (response) {
                deferred.resolve(response.data);
            }, function (response) {
                deferred.reject(response);
            });
            return deferred.promise;
        }
    };
});

// 封装$http
app.service("Common", function ($http, $q, MainFactory, ApiService) {
    // 根据规格类型查找规格列表
    this.getConfigure = function (configureType) {
        return ApiService.get('/api/baseInfo/configure/findByConfigureType?configureType=' + configureType).then(function (response) {
            if (response.code === '000') {
                return _.map(response.result.configureReturnDTOs, function (item) {
                    return { key: item.configureId, value: item.configureCode, text: item.configureName };
                });
            } else {
                swal('请求规格失败', response.message, 'error');
            }
            return [];
        }, apiServiceError);
    }
    // 获取区域
    this.getLargeArea = function (largeAreaType) {
        return ApiService.get('/api/baseInfo/largeArea/findByLargeAreaType?largeAreaType=' + largeAreaType).then(function (response) {
            if (response.code === '000') {
                return _.map(response.result.largeAreaReturnDTO, function (item) {
                    return { key: item.largeAreaId, value: item.largeAreaCode, text: item.largeAreaName };
                });
            } else {
                swal('请求规格失败', response.message, 'error');
            }
            return [];
        }, apiServiceError);
    }
    // 城市
    this.getCity = function () {
        return ApiService.get('/api/baseInfo/city/findAllLogicStatusUsable').then(function (response) {
            if (response.code === '000') {
                return _.map(response.result.cityReturnDTOs, function (item) {
                    return { key: item.cityId, value: item.cityCode, text: item.cityName, regionId: item.regionId, regionCode: item.regionCode };
                });
            } else {
                swal('请求规格失败', response.message, 'error');
            }
            return [];
        }, apiServiceError);
    }
    // 站点
    this.getStation = function (largeAreaType) {
        return ApiService.get('/api/baseInfo/station/findAllUsable').then(function (response) {
            if (response.code === '000') {
                return _.map(response.result.stationReturnDTOs, function (item) {
                    return { key: item.stationId, value: item.stationCode, text: item.stationName, cityId: item.cityId, cityStatus: item.cityLogicStatus, regionId: item.regionId, regionStatus: item.regionLogicStatus, siteType: item.siteType };
                });
            } else {
                swal('请求规格失败', response.message, 'error');
            }
            return [];
        }, apiServiceError);
    }
});