var url = require('url');
var passport = require('passport');

exports.register = register;

function register(serviceInfo, expressApp) {
    // 所有注册的服务都加上svc前缀
    var path = '/svc' + serviceInfo.path;
    var realizeAfterWrap = _wrapRealize(serviceInfo.realizeFunction);

    if (!serviceInfo.oauth) {
        expressApp[serviceInfo.method](path, realizeAfterWrap);
    }
    else if (serviceInfo.oauth === 'simple-session') {
        expressApp[serviceInfo.method](path, [passport.authenticate('simple-session', {})], realizeAfterWrap);
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