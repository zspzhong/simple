// 更新关注股票的日数据
var stockDao = require('./service/stockDao.js');
var mailUtils = require(global['libDir'] + '/utils/mailUtils.js');

exports.run = run;

function run() {
    // 每日未收盘前不更新数据
    var currentHours = new Date().getHours();
    if (currentHours > 9 && currentHours < 15) {
        return;
    }

    var stockPoolList = [];
    var followingStockPriceList = [];

    async.series([_isAllowTrade, _queryCodePool, _queryCurrentDayInfo, _saveDayInfo], function (err) {
        if (err) {
            logger.error(err);
            mailUtils.errorNotification(err);
            return;
        }

        process.exit(0);
    });

    function _isAllowTrade(callback) {
        // todo 判断是否开盘，不开盘则终止后续操作
        var isAllowTrade = true;
        if (!isAllowTrade) {
            process.exit(0);
            return;
        }

        callback(null);
    }

    function _queryCodePool(callback) {
        stockDao.queryCodePool(function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            stockPoolList = _.map(result, function (item) {
                return item.prefix + item.code;
            });
            callback(null);
        });
    }

    function _queryCurrentDayInfo(callback) {
        stockDao.queryStockPriceFromSina(stockPoolList, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            _.each(result, function (item) {
                delete item.name;
                delete item.yesterdayClosePrice;

                item.date = new Date(item.date.format());
                followingStockPriceList.push(item);
            });
            callback(null);
        });
    }

    function _saveDayInfo(callback) {
        stockDao.addDayFollowingInfo(followingStockPriceList, callback);
    }
}