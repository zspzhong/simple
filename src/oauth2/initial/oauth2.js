var oauthServer = require('oauth2-server');

exports.oauth2Initial = oauth2Initial;

function oauth2Initial(expressApp) {
    expressApp.oauth = oauthServer({
        model: require('./model'),
        grants: ['auth_code', 'password'],
        debug: true
    });

    // Handle token grant requests
    expressApp.all('/oauth/token', expressApp.oauth.grant());

    // Show them the "do you authorise xyz app to access your content?" page
    expressApp.get('/oauth/authorise', function (req, res, next) {
        if (!req.session || !req.session.user) {
            // If they aren't logged in, send them to your own login implementation
            var loginUrl = '/login?redirect=' + req.path + '&client_id=' + req.query.client_id + '&redirect_uri=' + req.query.redirect_uri;
            res.redirect(loginUrl);
            return;
        }

        res.render('authorise', {
            client_id: req.query.client_id,
            redirect_uri: req.query.redirect_uri
        });
    });

    // Handle authorise
    expressApp.post('/oauth/authorise', function (req, res, next) {
        if (!req.session || !req.session.user) {
            res.redirect('/login?client_id=' + req.query.client_id + '&redirect_uri=' + req.query.redirect_uri);
            return;
        }
        next();
    }, expressApp.oauth.authCodeGrant(function (req, next) {
        // The first param should to indicate an error
        // The second param should a bool to indicate if the user did authorise the app
        // The third param should for the user/uid (only used for passing to saveAuthCode)
        next(null, req.body['allow'] === 'yes', req.session.user.id, req.session.user);
    }));

    // Show login
    expressApp.get('/login', function (req, res, next) {
        res.render('login', {
            redirect: req.query.redirect,
            client_id: req.query.client_id,
            redirect_uri: req.query.redirect_uri
        });
    });

    // Handle login
    expressApp.post('/login', function (req, res, next) {
        // Insert your own login mechanism
        // Successful logins should send the user back to the /oauth/authorise
        // with the client_id and redirect_uri (you could store these in the session)
        res.redirect((req.body.redirect || '/home') + '?client_id=' + req.body.client_id + '&redirect_uri=' + req.body.redirect_uri);
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