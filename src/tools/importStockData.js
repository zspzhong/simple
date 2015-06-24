var fs = require('fs');
var mysql = require(global['libDir'] + '/dao/mysql.js');

exports.run = run;

function run() {
    var stockCodeList = [];

    async.series([_initCodeList, _importAllData], function (err) {
        if (err) {
            console.log(err);
            return;
        }

        console.log('success');
    });

    function _initCodeList(callback) {
        var codeFilePath = '/Users/shasharoman/Downloads/stock/code';

        fs.readFile(codeFilePath, function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            stockCodeList = data.toString().split('\r');
            callback(null);
        });
    }

    function _importAllData(callback) {
        async.mapSeries(stockCodeList, _importOne, callback);

        function _importOne(code, callback) {
            var sql = "load data infile :filePath" +
                " into table stock.stock_day" +
                " fields terminated by ',' lines terminated by '\n'" +
                " ignore 1 lines;";

            var value = {
                filePath: '/Users/shasharoman/Downloads/stock/data/' + code + '.csv'
            };

            mysql.execSql(sql, value, function (err) {
                if (err) {
                    callback(err);
                    return;
                }

                console.log(code);
                callback(null);
            });
        }
    }
}