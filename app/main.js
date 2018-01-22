'use strict';

$.sound_path = appConfig.sound_path;
$.sound_on = appConfig.sound_on;

// sweetAlert全局配置
swal.setDefaults({allowEscapeKey: false, allowOutsideClick: false, allowEnterKey: false});

// 全局正则
var REGULAR = {};

var COMMON_URL = {
    bill: location.origin + '/coffeeBill',
    baseInfo: location.origin + '/baseInfoApi',
    oauth: location.origin + '/oauth'
};

var is8999 = (location.port === '8999');
if (is8999) {
    COMMON_URL = {
        bill: 'http://192.168.21.141:15009',
        baseInfo: 'http://192.168.21.141:15006',
        oauth: 'http://192.168.21.141:16001'
    };
    document.cookie = "userCode=CKGAA263; userName=周俊; paymentUrl=/payment; currentStationName=%E6%80%BB%E9%83%A8; currentStationCode=HDQA00; stationClass=CQ";
}


// 菜单对象
var MENU_OBJECT = {};
var MENU_MAP = [];
$(function () {
    // moment.js default language
    if (is8999) {
        moment.locale('zh');
        angular.bootstrap(document, ['app']);
    } else {
        loadMenu(function () {
            moment.locale('zh');
            angular.bootstrap(document, ['app']);
        });
    }

});

function loadMenu(callback) {
    $.ajax({
        url: "/oauth/api/oauth/jurisdiction/findUserJurisdictionByUserCode?userCode=" + $.cookie("userCode"),
        dataType: 'json',
        success: function (result) {
            if (result.code !== "000") {
                if (result.message) {
                    swal('提示', result.message, 'error');
                } else {
                    swal('提示', result.result.message, 'error');
                }
            } else {
                MENU_MAP = result.result.jurisdictionList;
                _.each(MENU_MAP, function (item) {
                    // 判断权限
                    var auth = item.symbol.split('');
                    item.needValidation = (item.symbol.indexOf('1') > -1);
                    // 获取是否展示菜单
                    item.show = (auth[0] === '1' || auth[1] === '1' || auth[3] === '1');

                    MENU_OBJECT[item.jurisdictionId] = {
                        code: item.jurisdictionCode,
                        urlAddress: item.urlAddress,
                        symbol: item.symbol,
                        name: item.jurisdictionName,
                        needValidation: item.needValidation,
                        id: item.jurisdictionId,
                        needToken: item.needToken
                    };
                });
                if (_.isFunction(callback)) {
                    callback();
                }
            }
        }
    });
}


/**
 * event - 包含 event 对象
 * xhr - 包含 XMLHttpRequest 对象
 * options - 包含 AJAX 请求中使用的选项
 * exc - 包含 JavaScript exception
 */
$(document).ajaxError(function (event, xhr, options, exc) {
    console.log(arguments);
    ajaxError(xhr);
});

// ajax请求和kendo报错处理
function ajaxError(xhr) {
    // xhr下面包含xhr  则是kendo报错 
    if (xhr && xhr.xhr) {
        xhr = xhr.xhr;
    }
    if (!xhr || !xhr.responseJSON) {
        swal("提示", "网络连接失败", "error");
    } else if (xhr.status === 403 || xhr.status === 401) {
        swal("提示", "没有该操作权限或登录过期！", "error");
    } else {
        var result = xhr.responseJSON.result || xhr.responseJSON;
        if (result && result.code === 101) {
            // location.href = '/login';
        } else {
            sweetAlert("提示", "请求失败", "error");
        }
    }
    hideLoadingModal();
}

// ApiService请求失败的处理
function apiServiceError(response) {
    if (response.data) {
        swal('请求失败', response.data.message, 'error');
    } else {
        swal('请求失败', '找不到请求目标!', 'error');
    }
}

// 显示隐藏加载窗
var loadCount = 0;

function showLoadingModal(notAdd) {
    if (!notAdd) {
        loadCount++;
    }
    $('#showLoadModal').stop().fadeIn(100);
}
function hideLoadingModal() {
    loadCount = loadCount <= 0 ? 0 : loadCount - 1;
    if (loadCount <= 0) {
        $('#showLoadModal').stop().fadeOut(100);
    }
}

function getTextByKey(array, key) {
    var result = _.find(array, function (item) {
        return item.key === key;
    });
    return !result ? '' : result.text;
}

function getTextByVal(array, value) {
    var result = _.find(array, function (item) {
        return item.value === value;
    });
    return !result ? '' : result.text;
}

// 生成字母+数字的指定位数的随机数
var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
function generateMixed(n) {
    var res = "";
    for (var i = 0; i < n; i++) {
        var id = Math.ceil(Math.random() * 61);
        res += chars[id];
    }
    return res;
}

// kendo表格拓展行号
(function () {
    // ExtGrid
    var ExtGrid = kendo.ui.Grid.extend({
        init: function (element, options) {
            var that = this;

            that._orderNumber(options);

            kendo.ui.Grid.fn.init.call(that, element, options);
            that._RegisterRowNumber(options);
        },
        _orderNumber: function (options) {
            if (options.rowNumber) {
                var that = this;
                var rowTemplate = '#= count #';
                var renderRowCount = function () {
                    that.options._count += 1;
                    return kendo.render(kendo.template(rowTemplate), [{count: that.options._count}]);
                };

                if (options.rowNumber) {
                    if (options.columns) {
                        //1. 添加行号列
                        options.columns.splice(0, 0, {
                            attributes: {'class': 'tight-cell text-center'},
                            editor: null,
                            editable: false,
                            title: '',
                            template: renderRowCount,
                            width: 38
                        });
                    }
                }
            }
        },
        _RegisterRowNumber: function () {
            var that = this;
            if (that.options.rowNumber) {
                var that = this;
                that.bind('dataBinding', function () {
                    that.options._count = (that.dataSource.page() - 1) * that.dataSource.pageSize();
                    that.options._count = isNaN(that.options._count) ? 0 : that.options._count;
                });
            }
        },
        options: {
            name: 'ExtGrid',
            _count: 0,
            rowNumber: false
        }
    });

    kendo.ui.plugin(ExtGrid);
})();


/* 对Date的扩展，将 Date 转化为指定格式的String 
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
 * 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * eg:
 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423
 * (new Date()).format("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
 * (new Date()).format("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
 * (new Date()).format("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
 * (new Date()).format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */
function formatDate(date, fmt) {
    if (!date) {
        return '';
    }
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    var week = {
        "0": "/u65e5",
        "1": "/u4e00",
        "2": "/u4e8c",
        "3": "/u4e09",
        "4": "/u56db",
        "5": "/u4e94",
        "6": "/u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

// 输入数字
function inputNumber(element, options) {
    options = options ? options : {};
    element.on({
        compositionstart: function () {
            var $this = $(this);
            $this.unbind('input')
        },
        compositionend: function () {
            inputFunction();
            $(this).on('input', inputFunction);
        },
        input: inputFunction
    });

    function inputFunction() {
        var val = element.val();
        var reg = /\d+/g;
        var result = reg.exec(val);
        if (!result) {
            element.val('');
        } else {
            val = parseInt(result[0]);
            var maxNumber = parseInt(options.maxNumber);
            var minNumber = parseInt(options.minNumber);
            if (maxNumber && maxNumber < val) {
                val = maxNumber
            }
            if (minNumber && minNumber > val) {
                val = minNumber
            }
            if (val > 9999999) {
                val = 9999999;
            }
            element.val(val);
        }
    }
}

function getKendoData(response) {
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
}