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
exports.queryCompanyCode2Name = queryCompanyCode2Name;
exports.queryUserFavorite = queryUserFavorite;
exports.queryUserFavoriteMaxSortNo = queryUserFavoriteMaxSortNo;
exports.saveFavorite = saveFavorite;
exports.queryFavoriteSortNoByUsernameAndCode = queryFavoriteSortNoByUsernameAndCode;
exports.deleteFavoriteAndResortOther = deleteFavoriteAndResortOther;
exports.moveFavorite = moveFavorite;
exports.queryUserPosition = queryUserPosition;
exports.queryCodeIsExists = queryCodeIsExists;
exports.queryUserPositionOfCode = queryUserPositionOfCode;
exports.queryUserPositionMaxSortNo = queryUserPositionMaxSortNo;
exports.addTrendHistoryChangePosition = addTrendHistoryChangePosition;
exports.movePosition = movePosition;
exports.queryUserHistory = queryUserHistory;

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
    dataUtils.objIgnore2DB('stock_code_pool', model, callback);
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
    var sql = 'select max(sort_no) as maxSortNo from stock_user_favorite where user_id = :username;';

    dataUtils.execSql(sql, {username: username}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (_.isNull(result[0]['maxSortNo'])) {
            callback(null, -1);
            return;
        }

        callback(null, result[0]['maxSortNo'] || 0);
    });
}

function saveFavorite(favorite, callback) {
    dataUtils.objIgnore2DB('stock_user_favorite', favorite, callback);
}

function queryFavoriteSortNoByUsernameAndCode(username, code, callback) {
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

function deleteFavoriteAndResortOther(username, code, sortNo, callback) {
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

function moveFavorite(username, code, from, to, callback) {
    var sql = 'update stock_user_favorite set sort_no = sort_no + 1 where user_id = :username and sort_no < :from and sort_no >= :to;';
    var value = {username: username, from: from, to: to};

    if (from < to) {
        sql = 'update stock_user_favorite set sort_no = sort_no - 1 where user_id = :username and sort_no > :from and sort_no <= :to;';
        value = {username: username, from: from, to: to};
    }

    dataUtils.execSql(sql, value, function (err) {
        if (err) {
            callback(err);
            return;
        }

        var sql = 'update stock_user_favorite set sort_no = :to where user_id = :username and code = :code;';
        var value = {username: username, code: code, to: to};
        dataUtils.execSql(sql, value, callback);
    });
}

function queryUserPosition(username, callback) {
    var sql = 'select concat(b.prefix, a.code) as codeWithPrefix, a.cost_price, a.volume' +
        ' from stock_user_position a, stock_code_name b' +
        ' where a.user_id = :username and a.code = b.code order by a.sort_no;';

    dataUtils.execSql(sql, {username: username}, callback);
}

function queryCodeIsExists(code, callback) {
    dataUtils.query('stock_code_name', {code: code}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, !_.isEmpty(result));
    });
}

function queryUserPositionOfCode(username, code, callback) {
    var condition = {
        user_id: username,
        code: code
    };

    dataUtils.query('stock_user_position', condition, callback);
}

function queryUserPositionMaxSortNo(username, callback) {
    var sql = 'select max(sort_no) as maxSortNo from stock_user_position where user_id = :username;';

    dataUtils.execSql(sql, {username: username}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (_.isNull(result[0]['maxSortNo'])) {
            callback(null, -1);
            return;
        }

        callback(null, result[0]['maxSortNo'] || 0);
    });
}

function addTrendHistoryChangePosition(username, model, callback) {
    async.series([_saveHistoryAndPosition, _adjustZeroVolumePosition], callback);

    function _saveHistoryAndPosition(callback) {
        var sqlList = [];

        sqlList.push(dataUtils.insertSqlOfObj('stock_user_trend_history', model.history));

        if (!_.isEmpty(model.addPosition)) {
            sqlList.push(dataUtils.insertSqlOfObj('stock_user_position', model.addPosition));
        }

        if (!_.isEmpty(model.updatePosition)) {
            sqlList.push(dataUtils.updateSqlOfObj('stock_user_position', model.updatePosition, ['cost_price', 'volume'], ['user_id', 'code']));
        }

        dataUtils.batchExecSql(sqlList, callback);
    }

    // 将数量为0的持仓删除掉
    function _adjustZeroVolumePosition(callback) {
        var zeroVolumeCode = '';
        var zeroVolumeSortNo = 0;

        async.series([_queryZeroVolumeCode, _doAdjust], callback);

        function _queryZeroVolumeCode(callback) {
            var sql = 'select code, sort_no from stock_user_position where user_id = :username and volume <= 0;';
            dataUtils.execSql(sql, {username: username}, function (err, result) {
                if (err) {
                    callback(err);
                    return;
                }

                if (!_.isEmpty(result)) {
                    zeroVolumeCode = result[0].code;
                    zeroVolumeSortNo = result[0].sort_no;
                }

                callback(null);
            });
        }

        function _doAdjust(callback) {
            if (_.isEmpty(zeroVolumeCode)) {
                callback(null);
                return;
            }

            var sqlList = [
                {
                    sql: 'delete from stock_user_position where user_id = :username and code = :code',
                    value: {username: username, code: zeroVolumeCode}
                },
                {
                    sql: 'update stock_user_position set sort_no = sort_no - 1 where user_id = :username and sort_no > :sortNo',
                    value: {username: username, sortNo: zeroVolumeSortNo}
                }
            ];

            dataUtils.batchExecSql(sqlList, callback);
        }
    }
}

function movePosition(username, code, from, to, callback) {
    var sql = 'update stock_user_position set sort_no = sort_no + 1 where user_id = :username and sort_no < :from and sort_no >= :to;';
    var value = {username: username, from: from, to: to};

    if (from < to) {
        sql = 'update stock_user_position set sort_no = sort_no - 1 where user_id = :username and sort_no > :from and sort_no <= :to;';
        value = {username: username, from: from, to: to};
    }

    dataUtils.execSql(sql, value, function (err) {
        if (err) {
            callback(err);
            return;
        }

        var sql = 'update stock_user_position set sort_no = :to where user_id = :username and code = :code;';
        var value = {username: username, code: code, to: to};
        dataUtils.execSql(sql, value, callback);
    });
}

function queryUserHistory(username, callback) {
    var sql = 'select a.code, a.date, a.price, a.volume, a.type, a.profit, b.name' +
        ' from stock_user_trend_history a, stock_code_name b' +
        ' where a.user_id = :username and a.code = b.code order by a.date desc;';

    dataUtils.execSql(sql, {username: username}, callback);
}