var url = require('url');
var passport = require('passport');

exports.register = register;
exports.remove = remove;

function register(routerInfo) {
    // 所有注册的服务都加上svc前缀
    var path = '/svc' + routerInfo.path;
    var realizeAfterWrap = _wrapRealize(routerInfo.realizeFunction);

    if (!routerInfo.oauth) {
        global.express[routerInfo.method](path, realizeAfterWrap);
    }
    else if (routerInfo.oauth === 'simple-session') {
        global.express[routerInfo.method](path, [passport.authenticate('simple-session', {})], realizeAfterWrap);
    }

    // 统一全局返回的JSON格式
    function _wrapRealize(realize) {
        return function (req, res, next) {
            realize(req, res, function (err, result) {
                if (err) {
                    logger.error(err);
                    next(err);
                    return;
                }

                result = result || {};
                if (_.isUndefined(result.code)) {
                    result = _.extend({code: 0}, {result: result});
                }

                var statusCode = res.statusCode || 200;
                res.writeHead(statusCode, {'Content-Type': "application/json;charset=UTF-8"});
                res.end(JSON.stringify(result));
            });
        };
    }
}

function remove(routerInfo) {
    //todo
}