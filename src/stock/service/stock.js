var logger = global.logger;
var stockDao = require('./stockDao.js');
var requestUtils = require(global['libDir'] + '/utils/requestUtils.js');

exports.calculateProfit = calculateProfit;
exports.followTrend = followTrend;

// 根据买卖点以及量计算收益 [{date: x, type: 'sale' | 'buy', volume: y}]
function calculateProfit(req, res, callback) {
    var code = req.params['stockCode'];
    var operateList = req.body['operateList'] || [];

    if (_.isEmpty(operateList)) {
        callback(null, '参数不正确');
        return;
    }

    var stockDayList = [];
    var profitInfo = {};

    async.series([_queryStockInfo, _calculate], function (err) {
        if (err) {
            if (err.isNormalError) {
                callback(null, err.msg);
                return;
            }

            logger.error(err);
            callback(err);
            return;
        }

        callback(null, _.extend(profitInfo, {code: code}));
    });

    function _queryStockInfo(callback) {
        stockDao.queryStock(code, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            stockDayList = result;
            callback(null);
        });
    }

    function _calculate(callback) {
        var cost = 0;
        var maxCost = 0;
        var totalVolume = 0;

        var previousAdjustPrice = null;
        var previousOpen = null;

        var firstCost = null;

        _.each(operateList, function (item) {
            var dayData = _.find(stockDayList, function (one) {
                return +new Date(one.date) === +new Date(item.date);
            });

            // 无当日交易数据
            if (_.isEmpty(dayData)) {
                callback({isNormalError: true, msg: code + '无当日交易数据，日期：' + item.date});
                return false;
            }

            if (item.type === 'buy' || item.type === 'b') {
                totalVolume += item.volume;
                cost += dayData.open * item.volume * 100;

                if (_.isNull(firstCost)) {
                    firstCost = cost;
                }
            }
            else if (item.type === 'sale' || item.type === 's') {
                // 卖时的价格因为无法模拟派股，根据后复权价来推断是否有派股
                var ratio = 1;
                var salePrice = dayData.open;
                if (!_.isNull(previousAdjustPrice)) {
                    ratio = dayData['adjust_price'] / previousAdjustPrice;
                }

                // 若与实际价格相差10%以上，则记为派股过，根据后复权价格计算当时每股的卖出价
                if (Math.abs(previousOpen * ratio - dayData.open) / dayData.open > 0.1) {
                    salePrice = previousOpen * ratio;
                }

                totalVolume -= item.volume;
                cost -= salePrice * item.volume * 100;
            }

            maxCost = Math.max(maxCost, cost);
            previousOpen = dayData.open;
            previousAdjustPrice = dayData['adjust_price'];
        });


        var begin = new Date(operateList[0].date).getTime();
        var end = new Date(operateList[operateList.length - 1].date).getTime();

        var allProfit = -cost;
        var years = (end - begin) / (86400000 * 365);

        var ratio = allProfit / maxCost;
        var annualReturn = Math.pow(Math.E, Math.log(Math.abs(ratio)) / years) - 1;

        profitInfo = {
            years: years,
            firstCost: firstCost,
            maxLose: maxCost - firstCost,
            allProfit: allProfit,
            annualReturn: annualReturn
        };

        callback(null);
    }
}

// 根据突破法进行买卖、20日最高时买进，10日最低时卖出
function followTrend(req, res, callback) {
    var code = req.params['stockCode'];
    var operateList = [];
    var stockDayList = [];

    var highInterval = 20;
    var lowInterval = 10;

    var profitResult = {};

    async.series([_queryStock, _calculateProfit], function (err) {
        if (err) {
            logger.error(err);
            callback(err);
            return;
        }

        callback(null, profitResult);
    });

    function _queryStock(callback) {
        var startDate = req.param['startDate'];
        var endDate = req.param['endDate'];

        stockDao.queryStock(code, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            stockDayList = result;

            if (!_.isUndefined(startDate)) {
                stockDayList = _.filter(stockDayList, function (item) {
                    return new Date(item.date).getTime() >= startDate;
                });
            }

            if (!_.isUndefined(endDate)) {
                stockDayList = _.filter(stockDayList, function (item) {
                    return new Date(item.date) <= endDate;
                });
            }

            callback(null);
        });
    }

    function _calculateProfit(callback) {
        _findOperateTime();

        var url = global.baseUrl + '/svc/stock/calculateProfit/' + code;

        requestUtils.postResource(url, {operateList: operateList}, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            profitResult = result;
            callback(null);
        });
    }

    function _findOperateTime() {
        if (_.isEmpty(stockDayList)) {
            return;
        }

        var previousOperateType = 'sale';
        var cacheQueue = [];
        _.each(stockDayList, function (item) {
            _updateQueue(item);

            if (previousOperateType !== 'buy' && item['adjust_price'] === cacheQueue.maxInHighInterval && cacheQueue.length >= highInterval) {
                operateList.push({
                    date: item.date,
                    type: 'buy',
                    volume: 10
                });
                previousOperateType = 'buy';
            }

            if (previousOperateType !== 'sale' && item['adjust_price'] === cacheQueue.minInLowInterval && cacheQueue.length >= lowInterval) {
                operateList.push({
                    date: item.date,
                    type: 'sale',
                    volume: 10
                });
                previousOperateType = 'sale';
            }
        });

        function _updateQueue(oneDay) {
            if (cacheQueue.length >= Math.max(highInterval, lowInterval)) {
                cacheQueue.shift();
            }

            cacheQueue.push(oneDay);

            cacheQueue.maxInHighInterval = cacheQueue[0]['adjust_price'];
            cacheQueue.minInLowInterval = cacheQueue[0]['adjust_price'];

            _.each(cacheQueue, function (item, index) {
                if (index >= cacheQueue.length - highInterval) {
                    cacheQueue.maxInHighInterval = Math.max(cacheQueue.maxInHighInterval, item['adjust_price']);
                }

                if (index >= cacheQueue.length - lowInterval) {
                    cacheQueue.minInLowInterval = Math.min(cacheQueue.minInLowInterval, item['adjust_price']);
                }
            });
        }
    }
}