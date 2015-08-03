var dataUtils = require(global['libDir'] + '/dao/dataUtils.js');
var mysql = require(global['libDir'] + '/dao/mysql.js');

exports.queryStock = queryStock;

function queryStock(code, callback) {
    var condition = {
        code: code,
        orderBy: {
            filed: 'date',
            type: 'asc'
        }
    };
    var filedList = ['date', 'open', 'adjust_price'];

    dataUtils.query('stock_day', condition, filedList, callback);
}