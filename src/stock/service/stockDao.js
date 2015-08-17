var dataUtils = require(global['libDir'] + '/dao/dataUtils.js');
var request = require('request');
var iconv = require('iconv-lite');

exports.queryStock = queryStock;
exports.queryCodePool = queryCodePool;
exports.queryStockHistoryPrice = queryStockHistoryPrice;
exports.queryStockPriceFromSina = queryStockPriceFromSina;
exports.addDayFollowingInfo = addDayFollowingInfo;

function queryStock(code, callback) {
    var condition = {
        code: code,
        orderBy: {
            filed: 'date',
            type: 'asc'
        }
    };
    var filedList = ['date', 'open', 'adjust_price'];

    dataUtils.query('stock_day', condition, filedList, callback);
}

function queryCodePool(callback) {
    dataUtils.query('stock_code_pool', {}, callback);
}

// return: {code1: [{price...}, ...], code2: [{price...}, ...]}
function queryStockHistoryPrice(codeList, beforeDays, callback) {
    if (_.isEmpty(codeList)) {
        callback(null, {});
        return;
    }

    var inCondition = dataUtils.buildInCondition(codeList);

    var sql = 'select code, date, close as price' +
        ' from stock_following where code in ' + inCondition.inSql +
        ' order by date desc limit 20;';

    var value = _.extend(inCondition.value, {beforeDays: beforeDays});

    dataUtils.execSql(sql, value, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, _.groupBy(result, 'code'));
    });
}

// return: {code1: {price, open, high, low...}, code2: {price, open, high, low...}}
function queryStockPriceFromSina(codeList, callback) {
    // 新浪股票接口
    var url = 'http://hq.sinajs.cn/list=' + codeList.join(',');
    var option = {
        url: url,
        encoding: null
    };

    var code2CurrentPrice = {};

    request.get(option, function (err, res, body) {
        if (err) {
            callback(err);
            return;
        }

        _convertSinaResult(iconv.decode(body, 'gb2312'));
        callback(null, code2CurrentPrice)
    });


    function _convertSinaResult(result) {
        eval(result);

        _.each(codeList, function (code) {
            var currentInfo = eval('hq_str_' + code).split(',');

            code2CurrentPrice[code] = {
                code: code.substring(2),
                name: currentInfo[0],
                date: new Date(),
                open: currentInfo[1],
                yesterdayClosePrice: currentInfo[2],
                close: currentInfo[3],
                high: currentInfo[4],
                low: currentInfo[5],
                volume: currentInfo[8],
                up_down: (currentInfo[3] - currentInfo[2]) / currentInfo[2]
            };
        });
    }
}

function addDayFollowingInfo(list, callback) {
    dataUtils.list2DB('stock_following', list, callback);
}