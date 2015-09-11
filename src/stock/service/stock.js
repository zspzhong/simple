var stockDao = require('./stockDao.js');

exports.calculateProfit = calculateProfit;
exports.followTrend = followTrend;
exports.followTrendOperateInfo = followTrendOperateInfo;

exports.calculateProfitWithArgs = calculateProfitWithArgs;
exports.followTrendWithArgs = followTrendWithArgs;
exports.addStock2Pool = addStock2Pool;
exports.addTrendHistory = addTrendHistory;
exports.marketCompanyCode2Name = marketCompanyCode2Name;
exports.userFavoriteData = userFavoriteData;
exports.addUserFavorite = addUserFavorite;
exports.deleteUserFavorite = deleteUserFavorite;
exports.moveUserFavorite = moveUserFavorite;

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

function addStock2Pool(req, res, callback) {
    var stockCode = req.params.stockCode;
    var prefix = '';

    async.series([_queryPrefix, _save2Pool], function (err) {
        if (err) {
            callback(err);
            return;
        }

        callback(null);
    });

    function _queryPrefix(callback) {
        stockDao.queryCodePrefix(stockCode, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            prefix = result;
            callback(null);
        });
    }

    function _save2Pool(callback) {
        var model = {
            code: stockCode,
            prefix: prefix,
            hold_state: 0
        };

        stockDao.addStock2Pool(model, callback);
    }
}

function addTrendHistory(req, res, callback) {
    var stockCode = req.params.stockCode;
    var type = req.query.type;
    var price = req.query.price;
    var volume = req.query.volume || 100;

    if (!stockCode || !type || !price) {
        callback(null, '参数不正确');
        return;
    }

    var model = {
        code: stockCode,
        date: new Date(),
        price: price,
        volume: volume,
        type: type
    };

    async.series([_updateCurrentHold, _addTrendHistory], function (err) {
        if (err) {
            logger.error(err);
            callback(null, '保存失败');
            return;
        }

        callback(null);
    });

    function _updateCurrentHold(callback) {
        stockDao.addOrUpdateStockHold(model, callback);
    }

    function _addTrendHistory(callback) {
        stockDao.addTrendHistory(model, callback);
    }
}

function marketCompanyCode2Name(req, res, callback) {
    stockDao.queryCompanyCode2Name(function (err, result) {
        if (err) {
            logger.error(err);
            callback(err);
            return;
        }

        callback(null, result);
    });
}

function userFavoriteData(req, res, callback) {
    var username = req.params.username;

    var codeList = [];
    var favoriteData = [];

    async.series([_queryFavoriteCode, _querySomeInfoFromSina], function (err) {
        if (err) {
            logger.error(err);
            callback(err);
            return;
        }

        callback(null, favoriteData);
    });

    function _queryFavoriteCode(callback) {
        stockDao.queryUserFavorite(username, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            codeList = result;
            callback(null);
        });
    }

    function _querySomeInfoFromSina(callback) {
        stockDao.queryStockPriceFromSina(codeList, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            _.each(codeList, function (code) {
                var currentInfo = result[code.substr(2)];

                if (_.isEmpty(currentInfo)) {
                    return;
                }

                var delta = Number(currentInfo.close - currentInfo.yesterdayClosePrice);
                var upDown = Number(currentInfo.up_down * 100);

                favoriteData.push({
                    code: code.substr(2),
                    name: currentInfo.name,
                    price: Number(currentInfo.close).toFixed(2),
                    priceDelta: (delta >= 0 ? ' ' : '') + delta.toFixed(2),
                    upDown: (delta >= 0 ? ' ' : '') + upDown.toFixed(2) + '%'
                });
            });

            callback(null);
        });
    }
}

function addUserFavorite(req, res, callback) {
    var username = req.body.username;
    var stockCode = req.body.stockCode;
    var sortNo = 0;

    async.series([_queryUserFavoriteMaxSortNo, _saveFavorite], callback);

    function _queryUserFavoriteMaxSortNo(callback) {
        stockDao.queryUserFavoriteMaxSortNo(username, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            sortNo = result;
            callback(null);
        });
    }

    function _saveFavorite(callback) {
        var model = {
            code: stockCode,
            user_id: username,
            sort_no: sortNo + 1
        };

        stockDao.saveFavorite(model, callback);
    }
}

function deleteUserFavorite(req, res, callback) {
    var username = req.body.username;
    var stockCode = req.body.stockCode;
    var sortNo = 0;

    async.series([_queryTargetSortNo, _deleteAndResortOther], callback);

    function _queryTargetSortNo(callback) {
        stockDao.querySortNoByUsernameAndCode(username, stockCode, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            sortNo = result;
            callback(null);
        });
    }

    function _deleteAndResortOther(callback) {
        stockDao.deleteAndResortOther(username, stockCode, sortNo, callback);
    }
}

function moveUserFavorite(req, res, callback) {
    var username = req.body.username;
    var stockCode = req.body.stockCode;
    var fromIndex = req.body['fromIndex'];
    var destinationIndex = req.body['destinationIndex'];

    stockDao.moveUserFavorite(username, stockCode, fromIndex, destinationIndex, callback);
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

        _discardLatestBuy();
        if (_.isEmpty(operateList)) {
            callback(null);
            return;
        }

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
        return !_.isEmpty(operate) && (operate.type === 'sale' || operate.type === 's');
    }

    function isBuyOperate(operate) {
        return !_.isEmpty(operate) && (operate.type === 'buy' || operate.type === 's');
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
    var beginDate = args.beginDate;
    var endDate = args.endDate;
    var highInterval = args.highInterval || 20;
    var lowInterval = args.lowInterval || 10;

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