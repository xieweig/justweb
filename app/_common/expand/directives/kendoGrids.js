'use strict';
/**
 * {
 *      url:'/api/xxxx',传入URL 会改变kendoSetting中的dataSource
 *      type:'post'//类型 默认post
 *      params:{} //参数对象
 *      primaryId:'' //主键  用于涉及表格内修改
 *      dataSource: {
 *          parameterMap: function (data) {
 *              console.log(data)
 *          },
 *          data: function (data) {
 *              console.log(data);
 *              return [{}, {}];
 *          }
 *      },
 *      kendoSetting:{} kendo的配置
 * }
 */
angular.module('SmartAdmin.Expand').directive('kendoGrids', function ($timeout, MainFactory) {
    return {
        restrict: 'A',
        scope: {
            options: '='
        },
        link: function (scope, elm) {
            if (!scope.options) {
                return;
            }
            var fields = {};
            var kendoSetting = scope.options.kendoSetting;
            if (!scope.options.dataSource) {
                scope.options.dataSource = {};
            }
            if (!scope.options.params) {
                scope.options.params = {};
            }
            // 如果URL不包含http 则加上全局host
            if (scope.options.url && scope.options.url.indexOf('http') < 0) {
                scope.options.url = MainFactory.host + scope.options.url;
            }
            var kendoPage = {
                page: 1,
                pageSizes: [1, 5, 10, 50, 100, 200],
                buttonCount: 5,
                messages: {
                    display: "显示{0}-{1}条，共{2}条",
                    empty: "没有数据",
                    page: "页",
                    of: "/ {0}",
                    itemsPerPage: "条/页",
                    first: "第一页",
                    previous: "前一页",
                    next: "下一页",
                    last: "最后一页",
                    refresh: "刷新"
                }
            };
            // 循环每一列数据,处理序号 单选按钮
            _.each(kendoSetting.columns, function (item, index) {
                if (item.selectable) {
                    // 每行的自带checkbox
                    item.width = 32;
                } else if (item.rowNumber) {
                    // 行号
                    kendoSetting.columns.splice(index, 1, {
                        title: '',
                        attributes: {'class': ' text-center'},
                        editable: false,
                        width: 40,
                        template: function (data) {
                            var rowNumber = 0;
                            _.find(data.parent(), function (item, index) {
                                if (item.uid === data.uid) {
                                    rowNumber = ++index;
                                    return true
                                }
                                return false;
                            });
                            return kendo.render(kendo.template('#= count #'), [{count: rowNumber}]);
                        }
                    });
                } else if (item.WdatePicker) {
                    item.editor = function (container, options) {
                        var input = $("<input class='k-input k-textbox' onchange='' readonly/>");
                        input.attr("name", options.field);
                        input.appendTo(container);
                        input.click(function () {
                            WdatePicker({
                                el: this,
                                dateFmt: item.WdatePicker === true ? 'yyyy-MM-dd HH:mm:ss' : item.WdatePicker,
                                enableKeyboard: false,
                                enableInputMask: false
                            });
                        });
                    }
                } else if (item.kType) {
                    switch (item.kType) {
                        case 'number':
                            item.editor = function (container, options) {
                                var input = $("<input class='k-input k-textbox'/>");
                                input.attr("name", options.field);
                                inputNumber(input);
                                input.appendTo(container);
                            };
                            break;
                        case 'decimal':
                            item.editor = function (container, options) {
                                var input = $("<input class='k-input k-textbox'/>");
                                input.attr("name", options.field);
                                input.blur(function () {
                                    var value = parseFloat(this.value);
                                    value = value < 0 ? -value : value;
                                    value = value > 9999999.99 ? 0 : value;
                                    this.value = value === value ? value : '';
                                });
                                input.appendTo(container);
                            };
                            break;
                    }
                } else if (item.field) {
                    // 其他
                    var fieldName = item.field;
                    if (fieldName) {
                        fields[fieldName] = {defaultValue: item.defaultValue, editable: item.editable === true, nullable: item.nullable, type: item.type, validation: item.validation};
                    }
                }
                // 设置单列可编辑状态 为Boolean需要转为函数 否则编辑会失效
                if (_.isUndefined(item.editable)) {
                    // 默认不可编辑
                    item.editable = function () {
                        return false;
                    };
                } else if (_.isBoolean(item.editable)) {
                    // 如果是Boolean值,转为对应的函数
                    if (item.editable) {
                        item.editable = function () {
                            return true;
                        };
                    } else {
                        item.editable = function () {
                            return false;
                        };
                    }
                }
            });

            if (scope.options.url) {
                // 如果有url则 dataSource会变成配置而不会存在数据
                var dataSource = {
                    batch: true,
                    transport: {
                        read: {
                            url: scope.options.url,
                            type: scope.options.type || 'POST',
                            dataType: "JSON",
                            headers: MainFactory.headers(scope.options.headers)
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                scope.options.params.page = options.page;
                                scope.options.params.pageSize = options.pageSize;

                                if (_.isFunction(scope.options.dataSource.parameterMap)) {
                                    scope.options.dataSource.parameterMap(scope.options.params);
                                }

                                // 转换数据格式
                                var type = ('' + scope.options.type).toUpperCase();
                                if (type === 'POST' || type === 'UNDEFINED') {
                                    return kendo.stringify(scope.options.params);
                                } else {
                                    return $.param(scope.options.params);
                                }
                            }
                        }
                    },
                    requestStart: function (e) {
                        showLoadingModal();
                        if (_.isFunction(scope.options.dataSource.requestStart)) {
                            scope.options.dataSource.requestStart(scope.options.params);
                        }
                    },
                    requestEnd: function (e) {
                        hideLoadingModal();
                        if (e.response) {
                            if (e.response.code !== '000') {
                                sweetAlert("操作失败", e.response.message, "error");
                            }
                        }
                    },
                    error: ajaxError,
                    schema: {
                        type: "json",
                        model: {
                            id: scope.options.primaryId,
                            fields: fields
                        },
                        total: function (data) {
                            for (var name in data.result) {
                                var totalNumber = parseInt(data.result[name].totalNumber || data.result[name].totalElements);
                                if (totalNumber === totalNumber && totalNumber >= 0) {
                                    return totalNumber;
                                } else {
                                    return 0;
                                }
                            }
                        }
                    }
                };
                // 如果传入了data 则使用传入的
                if (scope.options.dataSource && scope.options.dataSource.data) {
                    dataSource.schema.data = scope.options.dataSource.data;
                } else {
                    dataSource.schema.data = function (response) {
                        for (var name in response.result) {
                            var content = response.result[name];
                            if (content) {
                                if (content.hasOwnProperty("content")) {
                                    return content.content;
                                } else if (content.hasOwnProperty("results")) {
                                    return content.results;
                                } else {
                                    return content;
                                }
                            } else {
                                return null;
                            }
                        }
                        if (_.isFunction(dataSource.data)) {
                            dataSource.data(response);
                        }
                    }
                }
                // 如果使用了分页
                if (kendoSetting.pageable) {
                    dataSource.pageSize = 10;
                    dataSource.serverPaging = true;
                }
                kendoSetting.dataSource = dataSource;
            } else {
                // url不存在
                if (!kendoSetting.dataSource) {
                    kendoSetting.dataSource = {};
                } else if (_.isArray(kendoSetting.dataSource)) {
                    // 为数组需要转为对象 因为需要设置primary
                    var data = _.cloneDeep(kendoSetting.dataSource);
                    kendoSetting.dataSource = {
                        data: data
                    }
                }
                kendoSetting.dataSource.schema = {
                    type: "json",
                    model: {
                        id: scope.options.primaryId,
                        fields: fields
                    }
                };
            }


            // 拖动排序
            kendoSetting.reorderable = kendoSetting.reorderable === true;
            // 调整列大小
            kendoSetting.resizable = kendoSetting.resizable === undefined ? true : kendoSetting.resizable;
            // 筛选
            kendoSetting.filterable = kendoSetting.filterable === true;
            // 显示列菜单
            kendoSetting.columnMenu = kendoSetting.columnMenu === true;
            // 单列排序
            kendoSetting.sortable = kendoSetting.sortable === true;
            // 单列排序
            kendoSetting.pageable = kendoSetting.pageable === true ? kendoPage : false;

            // 如果不在timeout里面 modal中的表格会初始化不成功
            $timeout(function () {
                scope.options.kendoGrid = elm.kendoGrid(kendoSetting).data('kendoGrid');
                if (_.isFunction(scope.options.ready)) {
                    scope.options.ready();
                }
            });
        }
    }
});