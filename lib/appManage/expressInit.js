var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.initExpress = initExpress;

function initExpress() {
    var app = express();

    // 只在开发状态需要处理静态资源，部署后由nginx处理
    if (global['mode'] === 'dev') {
        app.use(express.static(global['rootDir'] + '/dev'));
    }

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    app.use('/svc', cookieParser());
    // todo 将session 持久化到mongo中
    app.use('/svc', session({
        secret: 'shasharoman',
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 5 * 60 * 60 * 1000
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    //// 保存user对象
    //passport.serializeUser(function (user, done) {
    //    done(null, user);
    //});
    //// 删除user对象
    //passport.deserializeUser(function (user, done) {
    //    done(null, user);
    //});
    passport.use('local', new LocalStrategy(
        function (username, password, done) {
            var user = {
                username: 'shasharoman',
                password: '888888'
            };

            if (username !== user.username) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            if (password !== user.password) {
                return done(null, false, {message: 'Incorrect password.'});
            }

            return done(null, user);
        }
    ));

    app.use(allowCrossDomain);

    global.express = app;
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