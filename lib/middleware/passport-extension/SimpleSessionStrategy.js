var passport = require('passport');
var util = require('util');

function Strategy() {
    passport.Strategy.call(this);
    this.name = 'simple-session';
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function (req, options) {
    var self = this;

    if (req.isAuthenticated() || (req.session && req.session.user)) {
        self.pass();
        return;
    }

    var token = (req.body && req.body['access_token']) || (req.query && req.query['access_token']) || req.headers['x-access-token'];
    if (!token && req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(' ');
        if (parts.length !== 2) {
            _fail(req);
            return;
        }

        var scheme = parts[0];
        var credentials = parts[1];

        if (/Bearer/i.test(scheme)) {
            token = credentials;
        }
    }

    if (token) {
        try {
            // todo 判断token是否有效

            self.pass();
        }
        catch (e) {
            _fail(req);
        }
    }

    function _fail(req) {
        if (_isXhrRequest(req)) {
            self.fail('401');
            return;
        }

        if (_.contains(req.url, '/svc/')) {
            self.fail('401');
            return;
        }

        self.redirect('/');
    }

    function _isXhrRequest(req) {
        var xRequestedWith = req.headers['XRequestedWith'] || req.headers['x-requested-with'] || req.headers['X-Requested-With'];
        if (xRequestedWith && xRequestedWith.indexOf('XMLHttpRequest') !== -1) {
            return true;
        }

        return !!req.headers['xhr'];
    }
};

module.exports = Strategy;
