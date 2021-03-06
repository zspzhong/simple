var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var MongoStore = require('connect-mongo')(session);
var SimpleSessionStrategy = require('./middleware/passport-extension/SimpleSessionStrategy.js');
var app = express();

exports.init = init;

function init() {
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    app.set('view engine', 'jade');
    app.set('views', global['srcDir'] + '/common/template');

    app.use('/svc', cookieParser());
    app.use('/svc', session({
        store: new MongoStore({
            url: 'mongodb://127.0.0.1:27017/simple_session'
        }),
        cookie: {
            maxAge: 2 * 60 * 60 * 1000
        },
        resave: true,
        saveUninitialized: true,
        secret: 'shasharoman'
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new SimpleSessionStrategy());

    app.use(allowCrossDomain);

    return app;
}


function allowCrossDomain(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization,Origin, Accept, Content-Type, X-HTTP-Method, X-HTTP-METHOD-OVERRIDE,XRequestedWith,X-Requested-With,xhr,custom-enterpriseId,x-clientappversion, x-wxopenid, x-devicetype');
    res.setHeader('Access-Control-Max-Age', '10');
    if ('OPTIONS' === req.method) {
        res.end("POST, GET, PUT, DELETE");
        return;
    }

    next();
}