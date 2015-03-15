exports.run = run;

var request = require('request');
var async = require('async');
var logger = global.logger;

var users = [
    {
        username: 'shasharoman',
        password: '888888'
    },
    {
        username: 'shashaluoman',
        password: '888888'
    }
];

function run() {
    async.each(users, loginOne, function (err) {
        if (err) {
            logger.error(err);
        }
    });
}

function loginOne(users, callback) {
    var options = {
        url: 'http://www.zimuzu.tv/User/Login/ajaxLogin',
        form: {
            account: users.username,
            password: users.password,
            from: 'loginpage'
        }
    };

    request.post(options, function (err, res, body) {
        if (err) {
            callback(err);
            return;
        }

        var result = JSON.parse(body);
        logger.info(result);
    });
}

