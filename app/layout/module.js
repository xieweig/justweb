"use strict";


angular.module('app.layout', ['ui.router'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                abstract: true,
                views: {
                    root: {
                        templateUrl: 'app/layout/layout.tpl.html',
                        controller: function ($scope, $rootScope, MainFactory) {
                            $rootScope.billType = [
                                { key: '1', value: '1', text: '配送计划' },
                                { key: '2', value: '2', text: '调剂计划' },
                                { key: '3', value: '3', text: '退库计划' },
                                { key: '4', value: '4', text: '退货计划' }
                            ];
                            // 循环获取导出结果
                            $rootScope.exportToExcel = function (url, params, timeConsuming) {
                                // timeConsuming为耗时 第一次应该为空
                                if (!timeConsuming) {
                                    timeConsuming = 0;
                                }
                                // 如果没有导出的key 则是第一次导出 所以深拷贝一次以免影响原来的参数
                                if (!params.excelUniqueIdentification) {
                                    params = _.cloneDeep(params);
                                }
                                ApiService.post(url, params, { hasHost: true }).then(function (response) {
                                    if (response.code !== '000') {
                                        swal('导出失败', response.message, 'error');
                                    } else {
                                        var exportResult = response.result.asyncTaskResult;
                                        if (!exportResult) {
                                            sweetAlert("导出失败", "未获取到返回的结果", "error");
                                        } else if (exportResult.status === 'Locked') {
                                            sweetAlert("提示", "当前有其他人正在导出，请稍后再试！", "error");
                                        } else if (exportResult.status === 'Finish') {
                                            $rootScope.download(exportResult.taskResult);
                                        } else if (exportResult.status === 'Working') {
                                            if (params) {
                                                params.excelUniqueIdentification = exportResult.uniqueIdentification;
                                            }

                                            timeConsuming += 5000;
                                            if (timeConsuming <= 580000) {
                                                showLoadingModal(true);
                                                $timeout(function () {
                                                    $rootScope.exportToExcel(url, params, timeConsuming);
                                                }, timeConsuming <= 30000 ? timeConsuming : 30000);
                                            } else {
                                                sweetAlert("提示", "请求超时!", "error");
                                            }
                                        }
                                    }
                                }, apiServiceError);
                            };

                            // 下载文件,改为点击一次的方式可以看到下载的错误
                            $rootScope.download = function (url) {
                                $scope.downloadUrl = url;
                                $uibModal.open({
                                    templateUrl: 'app/baseInfo/common/modals/download.html',
                                    size: 'sm',
                                    scope: $scope
                                });
                            };

                            // 打开页面直接下载
                            $scope.downloadFile = function (url) {
                                url = MainFactory.downloadUrl + url;
                                window.open(url);
                            };
                        }
                    }
                }
            });
        $urlRouterProvider.otherwise('/home');
    });

