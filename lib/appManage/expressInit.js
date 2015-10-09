var express = require('express');

exports.initExpress = initExpress;
var bodyParser = require('body-parser');

function initExpress() {
    var app = express();

    // 只在开发状态需要处理静态资源，部署后由nginx处理
    if (global['mode'] === 'dev') {
        app.use(express.static(global['rootDir'] + '/dev'));
    }

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

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