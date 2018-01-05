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
        host: 'http://192.168.21.56:15009',
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
    // 获取区域
    this.getLargeArea = function (largeAreaType) {
        return ApiService.get('http://192.168.21.56:15006/api/v1/baseInfo/largeArea/findByLargeAreaTypeForApi?largeAreaType=' + largeAreaType, { hasHost: true }).then(function (response) {
            if (response.code === '000') {
                return _.map(response.result.largeAreaApiReturnDTOs, function (item) {
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
        return ApiService.get('http://192.168.21.56:15006/api/v1/baseInfo/city/findAllUsableForApi', { hasHost: true }).then(function (response) {
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
    // 全部站点
    this.getStation = function (largeAreaType) {
        return ApiService.get('http://192.168.21.56:15006/api/v1/baseInfo/station/findAllUsableForApi', { hasHost: true }).then(function (response) {
            if (response.code === '000') {
                return _.map(response.result.stationApiReturnDTOs, function (item) {
                    return { key: item.stationId, value: item.stationCode, text: item.stationName, cityId: item.cityId, cityCode: item.cityCode, cityStatus: item.cityLogicStatus, regionId: item.regionId, regionCode: item.regionCode, regionStatus: item.regionLogicStatus, siteType: item.siteType };
                });
            } else {
                swal('请求规格失败', response.message, 'error');
            }
            return [];
        }, apiServiceError);
    }
    // 权限站点
    this.getScopeStation = function (largeAreaType) {
        return ApiService.get('http://192.168.21.56:15006/oauth/api/oauth/user/findUserManagementScope?userCode=' + $.cookie("userCode"), { hasHost: true }).then(function (response) {
            if (response.code === '000') {
                if (response.result.scopeStations) {
                    // 老基础资料接口
                    return _.map(response.result.scopeStations, function (item) {
                        return { key: '', value: item.stationCode, text: item.stationName, cityCode: item.city.cityCode, cityStatus: 'USABLE', regionCode: item.city.largeArea.largeAreaCode, regionStatus: 'USABLE', siteType: item.siteType };
                    });
                }
                return [];
            } else {
                swal('请求规格失败', response.message, 'error');
            }
            return [];
        }, apiServiceError);
    }
    // 根据货物code集合 获取货物明细
    this.getCargoByCodes = function (codes) {
        return ApiService.post('http://192.168.21.191:15006/api/v1/baseInfo/cargo/findByCargoCodeList', codes, { hasHost: true }).then(function (response) {
            if (response.code !== '000') {
                swal('', response.message, 'error');
            } else {
                var cargoList = response.result.cargoList;
                return cargoList;
            }
        }, apiServiceError);
    }
});