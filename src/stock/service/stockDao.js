var dataUtils = require(global['libDir'] + '/dao/dataUtils.js');
var request = require('request');
var iconv = require('iconv-lite');

exports.queryStock = queryStock;
exports.queryCodePool = queryCodePool;
exports.queryStockHistoryHighAndLowPrice = queryStockHistoryHighAndLowPrice;
exports.queryStockPriceFromSina = queryStockPriceFromSina;
exports.addDayFollowingInfo = addDayFollowingInfo;
exports.queryCodePrefix = queryCodePrefix;
exports.addStock2Pool = addStock2Pool;
exports.queryCodeWithoutEnoughData = queryCodeWithoutEnoughData;

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

// return: {code1: {code, lowIntervalMinPrice, highIntervalMaxPrice}, code2: {code, lowIntervalMinPrice, highIntervalMaxPrice}, ...]}
function queryStockHistoryHighAndLowPrice(codeList, args, callback) {
    if (_.isEmpty(codeList)) {
        callback(null, {});
        return;
    }

    var inCondition = dataUtils.buildInCondition(codeList);

    var sql = 'select a.code, a.lowIntervalMinPrice, b.highIntervalMaxPrice' +
        ' from (select a.code, min(a.before_rehabilitation) as lowIntervalMinPrice from (select code, before_rehabilitation from stock_following where code in ' + inCondition.inSql + ' order by date desc limit :lowLimit) as a group by a.code) as a' +
        ' ,(select a.code, max(a.before_rehabilitation) as highIntervalMaxPrice from (select code, before_rehabilitation from stock_following where code in ' + inCondition.inSql + ' order by date desc limit :highLimit) as a group by a.code) as b' +
        ' where a.code = b.code;';

    var limitCondition = {
        lowLimit: args.lowSaleInterval * codeList.length,
        highLimit: args.highBuyInterval * codeList.length
    };
    var value = _.extend(inCondition.value, limitCondition);

    dataUtils.execSql(sql, value, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, _.indexBy(result, 'code'));
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

            code2CurrentPrice[code.substring(2)] = {
                code: code.substring(2),
                name: currentInfo[0],
                date: new Date(),
                open: currentInfo[1],
                yesterdayClosePrice: currentInfo[2],
                close: currentInfo[3],
                high: currentInfo[4],
                low: currentInfo[5],
                volume: currentInfo[8],
                up_down: (currentInfo[3] - currentInfo[2]) / currentInfo[2],
                before_rehabilitation: currentInfo[1],
                isCurrentDate: new Date(currentInfo[30]).getDate() === new Date().getDate()
            };
        });
    }
}

function addDayFollowingInfo(list, callback) {
    dataUtils.list2DB('stock_following', list, callback);
}

function queryCodePrefix(code, callback) {
    var condition = {
        code: code,
        limit: [0, 1]
    };

    dataUtils.query('stock_day', condition, ['prefix'], function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (_.isEmpty(result)) {
            callback(null, '');
            return;
        }

        callback(null, result[0].prefix);
    });
}

function addStock2Pool(model, callback) {
    dataUtils.obj2DB('stock_code_pool', model, callback);
}

function queryCodeWithoutEnoughData(dayLeast, callback) {
    var sql = 'select a.code' +
        ' from (select code, count(code) as counts from stock_following group by code) as a' +
        ' where a.counts < :dayLeast;';

    dataUtils.execSql(sql, {dayLeast: dayLeast}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, _.pluck(result, 'code'));
    });
}