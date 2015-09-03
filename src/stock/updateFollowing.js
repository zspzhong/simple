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
    var beforeRehabilitationList = [];

    async.series([_isAllowTrade, _queryCodePool, _queryCurrentDayInfo, _saveDayInfo, _sendMail], function (err) {
        if (err) {
            logger.error(err);
            mailUtils.errorNotification(err);
            return;
        }

        process.exit(0);
    });

    function _isAllowTrade(callback) {
        // 判断是否开盘，不开盘则终止后续操作
        var isAllowTrade = true;

        var week = new Date().getDay();

        if (week === 6 || week === 0) {
            isAllowTrade = false;
        }

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

            result = _.filter(result, function (item) {
                return item.isCurrentDate;
            });


            _.each(result, function (item) {
                if ((item.open - item.yesterdayClosePrice) / item.yesterdayClosePrice > -0.1) {
                    return;
                }

                // 当天开盘价格低于前天收盘价10个点
                beforeRehabilitationList.push({
                    name: item.name,
                    code: item.code,
                    price: item.price,
                    ratio: item.up_down
                });
            });

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

    function _sendMail(callback) {
        if (_.isEmpty(beforeRehabilitationList)) {
            callback(null);
            return;
        }

        var mailText = '除权除息：\n';

        _.each(beforeRehabilitationList, function (item) {
            mailText += item.name + '(' + item.code + ')------' + item.price + '(' + item.ratio + ')\n';
        });

        mailUtils.sendMail({text: mailText}, callback);
    }
}