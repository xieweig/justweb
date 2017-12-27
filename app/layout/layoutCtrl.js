'use strict';

angular.module('app').controller('LayoutCtrl', function ($scope, $rootScope, MainFactory, largeArea, city, station) {

    $rootScope.billType = [
        { key: '1', value: '1', text: '配送计划' },
        { key: '2', value: '2', text: '调剂计划' },
        { key: '3', value: '3', text: '退库计划' },
        { key: '4', value: '4', text: '退货计划' }
    ];

    // 拼接站点树结构
    $rootScope.getStationTree = function (stationTtype) {
        var stationTree = [];
        // 将大区数组根据code转化为对象
        var largeAreaObject = _.zipObject(_.map(largeArea, function (item) { return item.key }), largeArea);
        // 将城市数组根据code转化为对象
        var cityObject = _.zipObject(_.map(city, function (item) { return item.key }), city);
        // 将站点排序 然后记录上一次城市ID  城市改变
        var largeAreaPos = {};
        var cityPos = {};
        _.each(station, function (item) {
            // 如果传入了stationTtype  则需要限制返回站点的类型
            if (stationTtype !== '' && stationTtype !== undefined && item.siteType !== stationTtype) {
                return;
            }
            var currentStation = { key: item.key, value: item.value, text: item.text, type: 'station' };
            // 如果区域被禁用  则直接添加
            if (item.regionStatus === 'DISABLED') {
                stationTree.push(currentStation);
                return;
            }
            // 判断该站点在结果中有没有对应区域 没有则增加
            var largeAreaSerial = largeAreaPos[item.regionId];
            if (largeAreaSerial === undefined) {
                // 测试站点存在对应大区没有的情况
                var largeAreaItem = largeAreaObject[item.regionId];
                largeAreaSerial = largeAreaPos[item.regionId] = stationTree.push({ expanded: true, key: largeAreaItem.key, value: largeAreaItem.value, text: largeAreaItem.text, type: 'largeArea', isNode: true, items: [] }) - 1;
            }
            // 获取该站点对应的大区在树中的索引
            var currentLargeArea = stationTree[largeAreaSerial];
            currentStation.regionId = currentLargeArea.key;
            currentStation.regionName = currentLargeArea.text;


            // 如果城市被禁用  则直接添加
            if (item.cityStatus === 'DISABLED') {
                currentLargeArea.items.push(currentStation);
                return;
            }

            // 判断该站点在前面的区域中有没有对应城市 没有则增加
            var citySerial = cityPos[item.cityId];
            if (citySerial === undefined) {
                // 测试站点存在对应大区没有的情况
                var cityItem = cityObject[item.cityId];
                citySerial = cityPos[item.cityId] = [largeAreaSerial, currentLargeArea.items.push({ expanded: true, key: cityItem.key, value: cityItem.value, text: cityItem.text, type: 'city', isNode: true, items: [] }) - 1];
            }
            // 获取该站点对应的城市在对应大于中的索引
            var currentCity = stationTree[citySerial[0]].items[citySerial[1]];
            currentStation.cityId = currentCity.key;
            currentStation.cityName = currentCity.text;
            currentCity.items.push(currentStation);
        });
        return stationTree;
    };

    // 循环获取导出结果
    $rootScope.exportToExcel = function (url, params, timeConsuming) {
        // timeConsuming为耗时
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
});