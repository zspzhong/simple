var passport = require('passport');
var util = require('util');
var jwt = require('jwt-simple');
var utils = require('../../utils/commonUtils.js');

var jwtSecret = 'shasharoman';

function Strategy() {
    passport.Strategy.call(this);
    this.name = 'simple-session';
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function (req, options) {
    var self = this;

    if (req.isAuthenticated()) {
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

        if (parts.length == 2) {
            var scheme = parts[0];
            var credentials = parts[1];

            if (/Bearer/i.test(scheme)) {
                token = credentials;
            }
        }
    }

    if (token) {
        try {
            var decoded = jwt.decode(token, jwtSecret);
            if (decoded.expries <= new Date().getTime()) {
                _fail(req);
                return;
            }

            req.session.username = decoded.username;
            self.pass();
        }
        catch (e) {
            _fail(req);
        }
    }

    function _fail(req) {
        if (utils.isXhrRequest(req)) {
            self.fail('401');
            return;
        }

        if (_.contains(req.url, '/svc/')) {
            self.fail('401');
            return;
        }

        self.redirect('/');
    }
};

module.exports = Strategy;
