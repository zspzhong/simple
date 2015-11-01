var oauthServer = require('oauth2-server');

exports.oauth2Initial = oauth2Initial;

function oauth2Initial(expressApp) {
    expressApp.oauth = oauthServer({
        model: require('./model'),
        grants: ['authorization_code', 'password'],
        debug: true
    });

    // Handle token grant requests
    expressApp.all('/svc/oauth/token', expressApp.oauth.grant());

    // 用户授权页
    expressApp.get('/svc/oauth/authorise', function (req, res, next) {
        if (!req.session || !req.session.user) {
            var loginUrl = '/login?redirect=' + req.path + '&client_id=' + req.query.client_id + '&redirect_uri=' + req.query.redirect_uri;
            res.redirect(loginUrl);
            return;
        }

        res.render('authorise', {
            client_id: req.query.client_id,
            redirect_uri: req.query.redirect_uri
        });
    });

    // 处理用户授权完成
    expressApp.post('/svc/oauth/authorise', function (req, res, next) {
        if (!req.session || !req.session.user) {
            res.redirect('/login?client_id=' + req.query.client_id + '&redirect_uri=' + req.query.redirect_uri);
            return;
        }
        next();
    }, expressApp.oauth.authCodeGrant(function (req, next) {
        // The first param should to indicate an error
        // The second param should a bool to indicate if the user did authorise the app
        // The third param should for the user/uid (only used for passing to saveAuthCode)
        var allow = (req.body['allow'] === 'yes');

        next(null, allow, req.session.user.id);
    }));

    expressApp.get('/oauth/login', function (req, res, next) {


        res.render('login.jade', {
            redirect: req.query.redirect,
            client_id: req.query.client_id,
            redirect_uri: req.query.redirect_uri
        });
    });

    expressApp.post('/oauth/login', function (req, res, next) {
        var authoriseUrl = (req.body.redirect || '/home') + '?client_id=' + req.body.client_id + '&redirect_uri=' + req.body.redirect_uri;

        res.redirect(authoriseUrl);
    });

    expressApp.get('/secret', expressApp.oauth.authorise(), function (req, res) {
        // Will require a valid access_token
        res.send('Secret area');
    });

    expressApp.get('/public', function (req, res) {
        // Does not require an access_token
        res.send('Public area');
    });

    // Error handling
    expressApp.use(expressApp.oauth.errorHandler());
}