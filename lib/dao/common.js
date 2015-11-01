var dataUtils = require('./dataUtils.js');

exports.queryUserById = queryUserById;
exports.queryUserByUserName = queryUserByUserName;

function queryUserByUserName(username, callback) {
    var sql = 'select id, username, password from user where username = :username;';
    dataUtils.execSql(sql, {username: username}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (_.isEmpty(result)) {
            callback(null, {});
            return;
        }

        callback(null, result[0]);
    });
}

function queryUserById(userId, callback) {
    var sql = 'select id, username, password from user where id = :id;';
    dataUtils.execSql(sql, {id: userId}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (_.isEmpty(result)) {
            callback(null, {});
            return;
        }

        callback(null, result[0]);
    });
}