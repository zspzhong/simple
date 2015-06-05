require('./initSystemValue.js').init();

var http = require('http');
var path = require('path');
var router = require(path.join(global['libDir'], 'router/router.js'));
var appManage = require(path.join(global['libDir'], 'appManage/appManage.js'));

appManage.startAllApp();
startService();

function startService() {
    http.createServer(_handleRequest).listen(global['port'], '127.0.0.1');

    function _handleRequest(req, res) {
        router.handleRequest(req, res, function (err, result) {
            if (err) {
                res.end('some error happened');
                return;
            }

            if (!_.isEmpty(result) && result.noNeedResponse) {
                return;
            }

            res.writeHead(200, {'Content-Type': "application/json;charset=UTF-8"});
            res.write(JSON.stringify(result));
            res.end();
        });
    }
}