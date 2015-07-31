var logger = global.logger;
var stockDao = require('./stockDao.js');

exports.calculateProfit = calculateProfit;

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

        callback(null, profitInfo);
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
            }
            else if (item.type === 'sale' || item.type === 's') {
                // 卖时的价格因为无法模拟派股，根据后复权价来推断是否有派股
                var ratio = 1;
                var salePrice = dayData.open;
                if (!_.isUndefined(_calculate.previousAdjustPrice)) {
                    ratio = dayData['adjust_price'] / _calculate.previousAdjustPrice;
                }

                // 若与实际价格相差10%以上，则记为派股过，根据后复权价格计算当时每股的卖出价
                if (Math.abs(_calculate.previousOpen * ratio - dayData.open) / dayData.open > 0.1) {
                    salePrice = _calculate.previousOpen * ratio;
                }

                totalVolume -= item.volume;
                cost -= salePrice * item.volume * 100;
            }

            maxCost = Math.max(maxCost, cost);
            _calculate.previousOpen = dayData.open;
            _calculate.previousAdjustPrice = dayData['adjust_price'];
        });


        var begin = new Date(operateList[0].date).getTime();
        var end = new Date(operateList[operateList.length - 1].date).getTime();

        var allProfit = -cost;
        var years = (end - begin) / (86400000 * 365);

        var ratio = allProfit / maxCost;
        var annualReturn = Math.pow(Math.E, Math.log(Math.abs(ratio)) / years) - 1;

        profitInfo = {years: years, maxCost: maxCost, allProfit: allProfit, annualReturn: annualReturn};
        callback(null);
    }
}