// 模拟趋势追踪，计算所有上市公司股票的收益
var logger = global.logger;
var dataUtils = require(global['libDir'] + '/dao/dataUtils.js');
var stockCalculate = require('../stock/service/stock.js');

exports.run = run;

function run() {
    logger.info('start');

    var list = [];
    var firstBegin = 1992;
    var lastBegin = 2004;

    _.times(lastBegin - firstBegin, function (item) {
        list.push({
            minBeginDate: new Date(firstBegin + item, 0, 1).getTime(),
            maxEndDate: new Date(firstBegin + item + 10, 0, 1).getTime(),
            highInterval: 20,
            lowInterval: 10
        });
    });

    async.eachSeries(list, calculateWithArgs, function (err) {
        if (err) {
            logger.error(err);
            process.exit(1);
            return;
        }
        logger.info('done');
        process.exit(0);
    });
}

function calculateWithArgs(args, callback) {
    var minBeginDate = args.minBeginDate;
    var maxEndDate = args.maxEndDate;
    var highInterval = args.highInterval;
    var lowInterval = args.lowInterval;

    var codeList = [];

    async.series([_codeCollection, _calculate, _statistic], callback);

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
                item.beginDate = Math.max(minBeginDate, new Date(item['firstDate']).getTime() + 31536000000 * 2);
                item.endDate = maxEndDate;
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
                    endDate: item.endDate,
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
                    min_begin_date: new Date(minBeginDate),
                    max_end_date: new Date(maxEndDate),
                    high_buy_interval: highInterval,
                    low_sale_interval: lowInterval,
                    years: profit.years,
                    first_cost: profit.firstCost,
                    profit: profit.allProfit,
                    annual_return: profit.annualReturn,
                    max_lose: profit.maxLose
                };

                logger.info(item.code + ' profit saving.');
                dataUtils.obj2DB('stock_follow_trend_profit', profitAfterTrans, callback);
            }
        }
    }

    function _statistic(callback) {
        var statisticResult = [];

        async.series([_doStatistic, _save], callback);

        function _doStatistic(callback) {
            var yearScopeList = [
                [0, 3],
                [3, 6],
                [6, 9],
                [9, 12],
                [12, 15],
                [15, 18],
                [18, 21],
                [21, 100],
                [0, 1000]
            ];

            async.each(yearScopeList, _statisticOne, callback);

            function _statisticOne(item, callback) {
                var sql = _buildOneSql(item[0], item[1]);

                dataUtils.execSql(sql.statement, sql.value, function (err, result) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    if (!_.isEmpty(result)) {
                        statisticResult.push(result[0]);
                    }

                    callback(null);
                });
            }

            function _buildOneSql(yearA, yearB) {
                var statement = 'select "' + yearB + '"' +
                    ' as yearScope, count(code) as codeCounts, avg(years) as avgYears, avg(first_cost) as avgFirstCost, avg(max_lose) as avgMaxLose, avg(profit) as avgProfit, avg(annual_return) as avgAnnualReturn' +
                    ' from stock_follow_trend_profit' +
                    ' where years between :yearA and :yearB and min_begin_date = :minBeginDate and max_end_date = :maxEndDate and high_buy_interval = :highInterval and low_sale_interval = :lowInterval;';
                var value = {
                    yearA: yearA,
                    yearB: yearB,
                    minBeginDate: new Date(minBeginDate),
                    maxEndDate: new Date(maxEndDate),
                    highInterval: highInterval,
                    lowInterval: lowInterval
                };

                return {
                    statement: statement,
                    value: value
                };
            }
        }

        function _save(callback) {
            var statisticAfterTrans = [];

            _.each(statisticResult, function (item) {
                statisticAfterTrans.push({
                    year_scope: item['yearScope'],
                    min_begin_date: new Date(minBeginDate),
                    max_end_date: new Date(maxEndDate),
                    high_buy_interval: highInterval,
                    low_sale_interval: lowInterval,
                    code_counts: item['codeCounts'],
                    avg_years: item['avgYears'],
                    avg_max_lose: item['avgMaxLose'],
                    avg_first_cost: item['avgFirstCost'],
                    avg_profit: item['avgProfit'],
                    avg_annual_return: item['avgAnnualReturn']
                });
            });

            logger.info('saving statistic.');
            dataUtils.list2DB('stock_follow_trend_statistic', statisticAfterTrans, callback);
        }
    }
}
