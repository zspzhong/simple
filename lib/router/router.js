var url = require('url');

exports.register = register;
exports.remove = remove;

function register(routerInfo) {
    // 所有注册的服务都加上svc前缀
    global.express[routerInfo.method]('/svc' + routerInfo.path, function (req, res, callback) {
        routerInfo.realizeFunction(req, res, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            if (_.isUndefined(result.code)) {
                result = _.extend({code: 0}, {result: result});
            }

            var statusCode = 200;
            if (res.statusCode) {
                statusCode = res.statusCode;
            }

            res.writeHead(statusCode, {'Content-Type': "application/json;charset=UTF-8"});
            res.end(JSON.stringify(result));
        });
    });
}

function remove(routerInfo) {
    //todo
}