// 模拟趋势追踪，计算所有上市公司股票的收益
var logger = global.logger;
var dataUtils = require(global['libDir'] + '/dao/dataUtils.js');
var stockCalculate = require('../stock/service/stock.js');

exports.run = run;

function run() {
    logger.info('start');

    var highInterval = 20;
    var lowInterval = 10;

    var codeList = [];

    async.series([_codeCollection, _calculate], function (err) {
        if (err) {
            logger.error(err);
            process.exit(1);
            return;
        }

        process.exit(0);
    });

    function _codeCollection(callback) {
        var sql = 'select a.code, a.date as firstDate' +
            ' from (select code, min(date) as date from stock_day group by code) as a' +
            ' where a.date < :date;';

        dataUtils.execSql(sql, {date: '2012-1-1'}, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            codeList = result;
            _buildCalculateInfo();
            callback(null);
        });

        // 从上市后2年才开始交易
        function _buildCalculateInfo() {
            _.each(codeList, function (item) {
                item.beginDate = new Date(item['firstDate']).getTime() + 31536000000 * 2;

                //item.endDate = new Date('2014-1-1').getTime();// 想避开这次牛市
            });
        }
    }

    function _calculate(callback) {
        async.eachLimit(codeList, 10, _calculateOne, callback);

        function _calculateOne(item, callback) {
            var profit = {};

            async.series([_findOperateDate, _saveCalculateResult], callback);

            function _findOperateDate(callback) {
                var args = {
                    stockCode: item.code,
                    beginDate: item.beginDate,
                    highInterval: highInterval,
                    lowInterval: lowInterval
                };

                stockCalculate.followTrendWithArgs(args, function (err, result) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    profit = result;
                    callback(null);
                });
            }

            function _saveCalculateResult(callback) {
                var profitAfterTrans = {
                    code: item.code,
                    years: profit.years,
                    first_cost: profit.firstCost,
                    profit: profit.allProfit,
                    annual_return: profit.annualReturn,
                    max_lose: profit.maxLose,
                    high_buy_interval: highInterval,
                    low_sale_interval: lowInterval
                };

                logger.info(item.code + ' profit saving.');
                dataUtils.obj2DB('stock_follow_trend_profit', profitAfterTrans, callback);
            }
        }
    }
}
