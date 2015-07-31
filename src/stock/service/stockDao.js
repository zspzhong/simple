var dataUtils = require(global['libDir'] + '/dao/dataUtils.js');
var mysql = require(global['libDir'] + '/dao/mysql.js');

exports.queryStock = queryStock;

function queryStock(code, callback) {
    var condition = {
        code_short: code
    };
    var filedList = ['date', 'open', 'close', 'high', 'low', 'up_down', 'adjust_price'];

    dataUtils.query('stock_day', condition, filedList, callback);
}