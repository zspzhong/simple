exports.run = run;

var logger = global.logger;
var request = require('request');
var jar = request.jar();
request = request.defaults({jar: jar});

function run() {
    async.series([_login, _entrustSale], function (err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('success');
    });

    function _login(callback) {
        var loginUrl = 'http://www.futunn.com/site/login-request';
        var options = {
            url: loginUrl,
            form: 'username=615539&password=cefe0dc7642fb52e3c81ed928893853b'
        };

        request.post(options, function (err, res, body) {
            if (err) {
                callback(err);
                return;
            }

            if (_.isEmpty(body) || body.code != '0') {
                callback(body);
                return;
            }

            callback(null);
        });
    }

    function _entrustSale(callback) {
        var entrustSaleUrl = 'http://www.futunn.com/trade/input-order';
        var options = {
            url: entrustSaleUrl,
            form: 'account_id=22051&stockCode=600031&price=8.75&qty_str=1000&quantity=1000&security_id=52548926466591&side=A'
        };

        request.post(options, function (err, res, body) {
            if (err) {
                callback(err);
                return;
            }

            if (_.isEmpty(body) || body.code != '0') {
                callback(body);
                return;
            }

            callback(null);
        });
    }
}