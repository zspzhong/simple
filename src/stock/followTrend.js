var stockDao = require('service/stockDao.js');
var logger = global.logger;

exports.run = run;

function run() {
    var highBuyInterval = 20;
    var lowSaleInterval = 10;

    var errorMsgList = [];

    var stockPoolList = [];
    var code2LowAndHighPrice = {};
    var code2CurrentPrice = {};

    async.series([_isAllowTrade, _queryCodePool, _filterCodeWithoutEnoughData, _queryHistoryHighAndLowPrice, _queryCurrentPrice, _sendEmail], function (err) {
        if (err) {
            logger.error(err);
            process.exit(1);
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

            stockPoolList = result;
            callback(null);
        });
    }

    // 过滤数据不够判断的股票
    function _filterCodeWithoutEnoughData(callback) {
        stockDao.queryCodeWithoutEnoughData(highBuyInterval, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            stockPoolList = _.filter(stockPoolList, function (item) {
                return !_.includes(result, item.code);
            });
            callback(null);
        });
    }

    function _queryHistoryHighAndLowPrice(callback) {
        var codeList = _.pluck(stockPoolList, 'code');

        var args = {
            highBuyInterval: highBuyInterval,
            lowSaleInterval: lowSaleInterval
        };

        stockDao.queryStockHistoryHighAndLowPrice(codeList, args, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            code2LowAndHighPrice = result;
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

            _.each(code2LowAndHighPrice, function (priceInfo, code) {
                var currentPriceInfo = code2CurrentPrice[code];

                if (_.isEmpty(currentPriceInfo)) {
                    return;
                }

                priceInfo.name = currentPriceInfo.name;
                priceInfo.currentPrice = currentPriceInfo.close;
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

        _.each(code2LowAndHighPrice, function (priceInfo, code) {
            if (_.contains(currentHoldCodeList, code)) {
                _pickSale(priceInfo, code);
                return;
            }

            _pickBuy(priceInfo, code);
        });

        return operateList;

        function _pickBuy(priceInfo, code) {
            if (priceInfo.currentPrice - priceInfo['highIntervalMaxPrice'] > 0.01) {
                return;
            }

            operateList.push({
                code: code,
                name: priceInfo.name,
                price: priceInfo.currentPrice,
                operate: 'buy'
            });
        }

        function _pickSale(priceInfo, code) {
            if (priceInfo.currentPrice - priceInfo['lowIntervalMinPrice'] < -0.01) {
                return;
            }

            operateList.push({
                code: code,
                name: priceInfo.name,
                price: priceInfo.currentPrice,
                operate: 'sale'
            });
        }
    }
}