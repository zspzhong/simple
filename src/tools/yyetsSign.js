exports.run = run;

var logger = global.logger;
var request = require('request');
var jar = request.jar();
request = request.defaults({jar: jar});

var users = [
    {
        username: 'shashaluoman',
        password: '888888'
    },
    {
        username: 'shasharoman',
        password: '888888'
    }
];

function run() {
    async.mapSeries(users, signOne, function (err) {
        if (err) {
            logger.info(err);
        }
    });
}

function signOne(user, callback) {
    var loginCookies = {};
    var signCookies = {};

    async.series([_login, _requestSignPage, _doSign], callback);

    function _login(callback) {
        var loginUrl = 'http://www.zimuzu.tv/User/Login/ajaxLogin';
        var options = {
            url: loginUrl,
            form: {
                account: user.username,
                password: user.password,
                from: 'loginpage'
            }
        };

        request.post(options, function (err, res, body) {
            if (err) {
                callback(err);
                return;
            }

            loginCookies = request.cookie(jar.getCookieString(loginUrl));
            callback(null);
        });
    }

    function _requestSignPage(callback) {
        var signUrl = 'http://www.zimuzu.tv/user/sign';
        jar.setCookie(loginCookies, signUrl);

        var options = {
            url: signUrl
        };

        request.get(options, function (err, res, body) {
            if (err) {
                callback(err);
                return;
            }

            signCookies = request.cookie(jar.getCookieString(signUrl));
            callback(null);
        });
    }

    function _doSign(callback) {
        setTimeout(_sign, 20000);

        function _sign() {
            var doSignUrl = 'http://www.zimuzu.tv/user/sign/dosign';
            jar.setCookie(signCookies, doSignUrl);

            var options = {
                url: doSignUrl
            };

            request.get(options, function (err, res, body) {
                if (err) {
                    callback(err);
                    return;
                }

                logger.info(body);
                callback(null);
            });
        }
    }
}

