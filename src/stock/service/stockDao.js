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
exports.addTrendHistory = addTrendHistory;
exports.addOrUpdateStockHold = addOrUpdateStockHold;
exports.queryCompanyCode2Name = queryCompanyCode2Name;
exports.queryUserFavorite = queryUserFavorite;
exports.queryUserFavoriteMaxSortNo = queryUserFavoriteMaxSortNo;
exports.saveFavorite = saveFavorite;
exports.querySortNoByUsernameAndCode = querySortNoByUsernameAndCode;
exports.deleteAndResortOther = deleteAndResortOther;
exports.moveUserFavorite = moveUserFavorite;

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

function addTrendHistory(history, callback) {
    dataUtils.obj2DB('stock_trend_history', history, callback);
}

function addOrUpdateStockHold(model, callback) {
    var code = model.code;

    var isHolding = true;
    var holdInfo = {};

    async.series([_queryIsHolding, _addOrUpdate], callback);

    function _queryIsHolding(callback) {
        var sql = 'select * from stock_current_hold where code = :code;';

        dataUtils.execSql(sql, {code: code}, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            if (!_.isEmpty(result)) {
                holdInfo = result[0];
            }

            isHolding = !_.isEmpty(result);
            callback(null);
        });
    }

    function _addOrUpdate(callback) {
        if (!isHolding) {
            var holdModel = {
                code: model.code,
                cost_price: model.price,
                volume: model.volume
            };

            dataUtils.obj2DB('stock_current_hold', holdModel, callback);
            return;
        }

        async.series([_update, _deleteNoVolumeHold], callback);

        function _update(callback) {
            var volumeDelta = (model.type === 'sale' ? -1 : 1) * model.volume;
            var costDelta = model.price * volumeDelta;
            var remainingVolume = model.volume + volumeDelta;
            var newCostPrice = 0;

            if (remainingVolume > 0) {
                newCostPrice = (holdInfo.cost_price * holdInfo.volume + costDelta) / remainingVolume;
            }

            var holdModel = {
                code: code,
                cost_price: newCostPrice,
                volume: remainingVolume
            };

            dataUtils.updateObj2DB('stock_current_hold', holdModel, 'code', callback);
        }

        function _deleteNoVolumeHold(callback) {
            var sql = 'delete from stock_current_hold where volume <= 0;';

            dataUtils.execSql(sql, {}, callback);
        }
    }
}

function queryCompanyCode2Name(callback) {
    var sql = 'select code, name from stock_code_name;';

    dataUtils.execSql(sql, {}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        var code2Name = {};

        _.each(result, function (item) {
            code2Name[item.code] = item.name;
        });

        callback(null, code2Name);
    });
}

function queryUserFavorite(username, callback) {
    var sql = 'select concat(b.prefix, a.code) as code' +
        ' from stock_user_favorite a, stock_code_name b' +
        ' where user_id = :userId and a.code = b.code order by a.sort_no;';

    dataUtils.execSql(sql, {userId: username}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, _.pluck(result, 'code'));
    });
}

function queryUserFavoriteMaxSortNo(username, callback) {
    var sql = 'select max(sort_no) as max_sort_no from stock_user_favorite where user_id = :username;';

    dataUtils.execSql(sql, {username: username}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (_.isEmpty(result)) {
            callback(null, 0);
            return;
        }

        callback(null, result[0]['max_sort_no'] || 0);
    });
}

function saveFavorite(favorite, callback) {
    dataUtils.obj2DB('stock_user_favorite', favorite, callback);
}

function querySortNoByUsernameAndCode(username, code, callback) {
    var sql = 'select sort_no from stock_user_favorite where user_id = :username and code = :code;';

    dataUtils.execSql(sql, {username: username, code: code}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (_.isEmpty(result)) {
            callback(null, 10000);
            return;
        }

        callback(null, result[0]['sort_no']);
    });
}

function deleteAndResortOther(username, code, sortNo, callback) {
    var sqlList = [];

    var condition = {
        username: username,
        code: code,
        sortNo: sortNo
    };

    sqlList.push({
        sql: 'delete from stock_user_favorite where user_id = :username and code = :code;',
        value: condition
    });

    sqlList.push({
        sql: 'update stock_user_favorite set sort_no = sort_no - 1 where user_id = :username and sort_no > :sortNo;',
        value: condition
    });

    dataUtils.batchExecSql(sqlList, callback);
}

function moveUserFavorite(username, code, from, to, callback) {
    var sqlList = [];

    var isLessToBig = from < to;

    if (isLessToBig) {
        sqlList.push({
            sql: 'update stock_user_favorite set sort_no = sort_no + 1 where user_id = :username and sort_no > :from and sort_no <= :to;',
            values: {username: username, from: from, to: to}
        });
    }
    else {
        sqlList.push({
            sql: 'update stock_user_favorite set sort_no = sort_no - 1 where user_id = :username and sort_no < :from and sort_no => :to;',
            values: {username: username, from: from, to: to}
        });
    }

    sqlList.push({
        sql: 'update stock_user_favorite set sort_no = :to where username = :username and code = :code;',
        values: {username: username, code: code, to: to}
    });

    dataUtils.batchExecSql(sqlList, callback);
}