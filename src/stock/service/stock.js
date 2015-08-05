var stockDao = require('./stockDao.js');

exports.calculateProfit = calculateProfit;
exports.followTrend = followTrend;
exports.followTrendOperateInfo = followTrendOperateInfo;

exports.calculateProfitWithArgs = calculateProfitWithArgs;
exports.followTrendWithArgs = followTrendWithArgs;

// 根据买卖点以及量计算收益 [{date: x, type: 'sale' | 'buy', volume: y}]
function calculateProfit(req, res, callback) {
    var stockCode = req.params.stockCode;
    var operateList = req.body['operateList'] || [];

    if (_.isEmpty(operateList)) {
        callback(null, '参数不正确');
        return;
    }

    var args = {
        stockCode: stockCode,
        operateList: operateList
    };

    calculateProfitWithArgs(args, callback);
}

// 根据突破法进行买卖、20日最高时买进，10日最低时卖出
function followTrend(req, res, callback) {
    var args = {
        stockCode: req.params.stockCode,
        beginDate: req.query.beginDate,
        endDate: req.query.endDate,
        highInterval: 20,
        lowInterval: 10
    };

    followTrendWithArgs(args, callback);
}

function followTrendOperateInfo(req, res, callback) {
    var args = {
        stockCode: req.params.stockCode,
        beginDate: req.query.beginDate,
        endDate: req.query.endDate,
        highInterval: 20,
        lowInterval: 10
    };

    followTrendOperateInfoWithArgs(args, callback);
}

// 内部接收参数方法，可暴露给其他模块调用
function calculateProfitWithArgs(args, callback) {
    var stockCode = args.stockCode;
    var operateList = args.operateList || [];
    var stockDayList = [];
    var profitInfo = {};

    async.series([_queryStockInfo, _calculate], function (err) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, _.extend(profitInfo, {stockCode: stockCode}));
    });

    function _queryStockInfo(callback) {
        stockDao.queryStock(stockCode, function (err, result) {
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

        if (_.isEmpty(operateList)) {
            return;
        }
        _discardLatestBuy();

        _.each(operateList, function (item) {
            var dayData = _.find(stockDayList, function (one) {
                return +new Date(one.date) === +new Date(item.date);
            });

            // 无当日交易数据
            if (_.isEmpty(dayData)) {
                callback({msg: stockCode + '无当日交易数据，日期：' + item.date});
                return false;
            }

            if (isBuyOperate(item)) {
                totalVolume += item.volume;
                cost += dayData.open * item.volume * 100;

                if (_.isNull(firstCost)) {
                    firstCost = cost;
                }
            }
            else if (isSaleOperate(item)) {
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
        var annualReturn = Math.pow(Math.E, Math.log(Math.abs(ratio + 1)) / years) - 1;

        profitInfo = {
            years: years,
            firstCost: firstCost,
            maxLose: maxCost - firstCost,
            allProfit: allProfit,
            annualReturn: annualReturn
        };

        callback(null);

        // 丢弃最后一笔买操作
        function _discardLatestBuy() {
            var latestOperate = operateList.pop();
            if (isSaleOperate(latestOperate)) {
                operateList.push(latestOperate);
            }
        }
    }

    function isSaleOperate(operate) {
        return _.isEmpty(operate) || operate.type === 'sale' || operate.type === 's';
    }

    function isBuyOperate(operate) {
        return _.isEmpty(operate) || operate.type === 'buy' || operate.type === 's';
    }
}

function followTrendWithArgs(args, callback) {
    var stockCode = args.stockCode;
    var operateList = [];

    var profitResult = {};

    async.series([_queryStockAndOperateTime, _calculateProfit], function (err) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, profitResult);
    });

    function _queryStockAndOperateTime(callback) {
        followTrendOperateInfoWithArgs(args, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            operateList = result;
            callback(null);
        });
    }

    function _calculateProfit(callback) {
        var args = {
            stockCode: stockCode,
            operateList: operateList
        };

        calculateProfitWithArgs(args, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            profitResult = result;
            callback(null);
        });
    }
}

function followTrendOperateInfoWithArgs(args, callback) {
    var stockCode = args.stockCode;
    var beginDate = args['beginDate'];
    var endDate = args['endDate'];
    var highInterval = args['highInterval'] || 20;
    var lowInterval = args['lowInterval'] || 10;

    var operateList = [];
    var stockDayList = [];

    _queryStock(function (err) {
        if (err) {
            callback(err);
            return;
        }

        _findOperateTime();
        callback(null, operateList);
    });

    function _queryStock(callback) {
        stockDao.queryStock(stockCode, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            stockDayList = result;

            if (!_.isUndefined(beginDate)) {
                stockDayList = _.filter(stockDayList, function (item) {
                    return new Date(item.date).getTime() >= beginDate;
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