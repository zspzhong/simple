var dataUtils = require(global['libDir'] + '/dao/dataUtils.js');
var mysql = require(global['libDir'] + '/dao/mysql.js');

exports.queryImageUrl = queryImageUrl;
exports.queryImageCount = queryImageCount;

function queryImageUrl(start, count, callback) {
    var condition = {
        limit: [start, count]
    };

    dataUtils.query('image_url', condition, ['image_url'], function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, _.pluck(result, 'image_url'));
    });
}

function queryImageCount(callback) {
    var sql = 'select count(image_url) as count from image_url;';

    mysql.execSql(sql, {}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, result[0].count);
    });
}