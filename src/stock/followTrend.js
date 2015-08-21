var stockDao = require('service/stockDao.js');
var logger = global.logger;

exports.run = run;

function run() {
    var highBuyInterval = 20;
    var lowSaleInterval = 10;

    var errorMsgList = [];

    var stockPoolList = [];
    var code2PriceList = {};
    var code2CurrentPrice = {};

    async.series([_isAllowTrade, _queryCodePool, _queryHistoryPrice, _queryCurrentPrice, _sendEmail], function (err) {
        if (err) {
            logger.error(err);
            process.exit(1);
            return;
        }

        process.exit(0);
    });

    function _isAllowTrade(callback) {
        // todo 判断是否开盘，不开盘则终止后续操作
        var isAllowTrade = true;

        var week = new Date().getDay();
        if (week === 6 || week === 7) {
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

            stockPoolList = result;
            callback(null);
        });
    }

    function _queryHistoryPrice(callback) {
        var codeList = _.pluck(stockPoolList, 'code');

        stockDao.queryStockHistoryPrice(codeList, highBuyInterval, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            code2PriceList = result;
            callback(null);
        });
    }

    function _queryCurrentPrice(callback) {
        var codeList = _.map(stockPoolList, function (item) {
            return item.prefix + item.code;
        });

        stockDao.queryStockPriceFromSina(codeList, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            code2CurrentPrice = result;

            _.each(code2PriceList, function (priceList, code) {
                var currentPriceInfo = code2CurrentPrice[code];

                if (_.isEmpty(currentPriceInfo)) {
                    return;
                }

                priceList.push({
                    price: currentPriceInfo.close,
                    date: new Date()
                });

                priceList.name = currentPriceInfo.name;
                priceList.currentPrice = currentPriceInfo.close;
            });

            callback(null);
        });
    }

    function _sendEmail(callback) {
        var beyondLimit = _beyondLimit();
        var currentHoldReachLimit = _currentHoldReachLimit();
        var operateList = _operateList();

        console.log(beyondLimit);
        console.log(currentHoldReachLimit);
        console.log(operateList);

        callback(null);
    }

    // 由于除权除息，开盘价跌幅超过10%
    function _beyondLimit() {
        var beyondLimitList = [];

        _.each(code2CurrentPrice, function (priceInfo, code) {
            var ratio = (priceInfo.close - priceInfo.yesterdayClosePrice) / priceInfo.yesterdayClosePrice;

            if (ratio > -0.1) {
                return;
            }

            beyondLimitList.push({
                code: code,
                name: priceInfo.name,
                ratio: ratio
            });
        });

        return beyondLimitList;
    }

    // 当前持仓中涨停或跌停
    function _currentHoldReachLimit() {
        var currentHoldReachLimit = [];

        var currentHoldCodeList = _.pluck(_.filter(stockPoolList, function (item) {
            return item['hold_state'] === 1;
        }), 'code');

        _.each(currentHoldCodeList, function (code) {
            var priceInfo = code2CurrentPrice[code];

            if (_.isEmpty(priceInfo)) {
                errorMsgList.push(new Date().format() + '持仓中' + code + '价格获取失败');
                return;
            }

            var ratio = (priceInfo.close - priceInfo.yesterdayClosePrice) / priceInfo.yesterdayClosePrice;

            if (Math.abs(ratio) < 0.98) {
                return;
            }

            currentHoldReachLimit.push({
                code: code,
                name: priceInfo.name,
                ratio: ratio
            });
        });

        return currentHoldReachLimit;
    }

    function _operateList() {
        var operateList = [];

        var currentHoldCodeList = _.pluck(_.filter(stockPoolList, function (item) {
            return item['hold_state'] === 1;
        }), 'code');

        _.each(code2PriceList, function (priceList, code) {
            if (_.contains(currentHoldCodeList, code)) {
                _pickSale(priceList, code);
                return;
            }

            _pickBuy(priceList, code);
        });

        return operateList;

        function _pickBuy(priceList, code) {
            var maxPrice = _.max(priceList, function (item) {
                return item.price;
            });

            if (Math.abs(priceList.currentPrice - maxPrice) < 0.01) {
                operateList.push({
                    code: code,
                    name: priceList.name,
                    price: priceList.currentPrice,
                    operate: 'buy'
                });
            }
        }

        function _pickSale(priceList, code) {
            var sortByDate = _.sortBy(priceList, function (item) {
                return -new Date(item.date).getTime();
            });

            var lowIntervalList = sortByDate.splice(0, lowSaleInterval);

            var minPrice = _.min(lowIntervalList, function (item) {
                return item.price;
            });

            if (Math.abs(priceList.currentPrice - minPrice) < 0.01) {
                operateList.push({
                    code: code,
                    name: priceList.name,
                    price: priceList.currentPrice,
                    operate: 'sale'
                });
            }
        }
    }
}