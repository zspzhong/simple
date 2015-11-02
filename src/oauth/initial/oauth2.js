var oauthServer = require('oauth2-server');
var commonDao = require(global['libDir'] + '/dao/common.js');
var utils = require(global['libDir'] + '/utils/commonUtils.js');
var md5 = require('MD5');
var request = require('request');

exports.oauth2Initial = oauth2Initial;

function oauth2Initial(expressApp) {
    expressApp.oauth = oauthServer({
        model: require('./model'),
        grants: ['authorization_code', 'password'],
        accessTokenLifetime: 7200,
        debug: true
    });

    expressApp.all('/svc/oauth/token', expressApp.oauth.grant());

    // 用户授权页
    expressApp.get('/svc/oauth/authorise', function (req, res, next) {
        var query = {
            redirect: req.path,
            client_id: req.query.client_id,
            redirect_uri: req.query.redirect_uri,
            response_type: req.query.response_type
        };

        if (!req.session || !req.session.user) {
            var loginUrl = '/svc/oauth/login?' + utils.transQuery2Str(query);
            res.redirect(loginUrl);
            return;
        }

        delete query.redirect;
        var authoriseUrl = '/svc/oauth/authorise?' + utils.transQuery2Str(query);

        res.render('authorise.jade', {authoriseUrl: authoriseUrl});
    });

    // 处理用户授权完成
    expressApp.post('/svc/oauth/authorise', function (req, res, next) {
        var clientId = req.body.clientId;
        var redirectUri = req.body.redirectUri;

        if (!req.session || !req.session.user) {
            var loginUrl = '/svc/oauth/login?redirect=' + req.path + '&client_id=' + clientId + '&redirect_uri=' + redirectUri;
            res.redirect(loginUrl);
            return;
        }

        next();
    }, expressApp.oauth.authCodeGrant(function (req, next) {
        next(null, true, req.session.user.id);
    }));

    expressApp.get('/svc/oauth/login', function (req, res, next) {
        var queryStr = utils.transQuery2Str(req.query);
        var loginUrl = '/svc/oauth/login' + (queryStr ? '?' + queryStr : '');

        res.render('login.jade', {
            username: '',
            loginUrl: loginUrl
        });
    });

    expressApp.post('/svc/oauth/login', function (req, res, next) {
        var redirect = req.query.redirect || '/';

        var queryCopy = _.clone(req.query);
        delete queryCopy.redirect;

        var queryStr = utils.transQuery2Str(queryCopy);
        var authoriseUrl = redirect + (queryStr ? '?' + queryStr : '');

        var username = req.body.username;
        var password = req.body.password;

        commonDao.queryUserByUserName(username, function (err, user) {
            if (err) {
                next(err);
                return;
            }

            var queryStr = utils.transQuery2Str(req.query);
            var loginUrl = '/svc/oauth/login' + (queryStr ? '?' + queryStr : '');
            var option = {
                username: username,
                loginUrl: loginUrl
            };

            if (_.isEmpty(user) || user.password !== md5(password)) {
                res.render('login.jade', option);
                return;
            }

            req.session.user = user;
            res.redirect(authoriseUrl);
        });
    });

    expressApp.get('/svc/oauth/callback', function (req, res, next) {
        var query = {
            client_id: 'shasharoman',
            client_secret: '888888',
            code: req.query.code,
            grant_type: 'authorization_code'
        };

        var url = 'http://localhost:8001/svc/oauth/token';

        var option = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: query
        };
        request.post(url, option, function (err, response, body) {
            if (err) {
                next(err);
                return;
            }

            var token = JSON.parse(body).access_token;
            req.session.user.access_token = token;
            res.end(body);
        });
    });

    expressApp.get('/secret', expressApp.oauth.authorise(), function (req, res) {
        // Will require a valid access_token
        res.send('Secret area');
    });

    expressApp.get('/public', function (req, res) {
        // Does not require an access_token
        res.send('Public area');
    });
}