'use strict'

angular.module('SmartAdmin.Expand').directive('treeView', function (MainFactory) {
    return {
        restrict: 'A',
        scope: {
            options: '='
        },
        link: function (scope, element, attributes) {
            var options = scope.options;
            if (!options) {
                return false;
            }
            // 如果URL不包含http 则加上全局host
            if (options.url && options.url.indexOf('http') < 0) {
                options.url = MainFactory.host + options.url;
            }
            // 根据url初始化dataSource
            if (!options.dataSource) {
                var dataSource = {
                    transport: {
                        read: {
                            url: options.url,
                            type: options.type || 'get',
                            dataType: "json"
                        }
                    }
                };
                // schema
                options.schema ? dataSource.schema = options.schema : '';
                // 设置data
                options.data ? dataSource.transport.read.data = options.data : '';
                // 初始化data
                options.dataSource = new kendo.data.HierarchicalDataSource(dataSource);
            }
            // 配置
            var treeOption = {
                dataSource: options.dataSource,
                dataTextField: options.dataTextField
            };
            //选择框
            options.checkboxes ? treeOption.checkboxes = options.checkboxes : '';
            // 选择框点击操作
            options.check ? treeOption.check = options.check : '';
            options.change ? treeOption.change = options.change : '';
            options.select ? treeOption.select = options.select : '';
            // 模板
            options.template ? treeOption.template = options.template : '';
            //初始化
            element.kendoTreeView(treeOption);
            options.treeView = element.data("kendoTreeView");
        }
    }
});