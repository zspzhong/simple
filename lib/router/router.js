var urlMatch = require('./pathRouter.js');

exports.register = register;
exports.remove = remove;
exports.handleRequest = handleRequest;

function register(path, method, fun) {
    urlMatch.addHandleOfPath(path, method, fun);
}

function remove(path, method) {
    urlMatch.removeHandleOfPath(path, method);
}

function handleRequest(req, res, callback) {
    var handleList = urlMatch.queryHandleOfUrl(req.url, req.method);

    if (!_.isArray(handleList)) {
        callback(null, 'page not find');
        return;
    }

    async.mapSeries(handleList, function (handle, callback) {
        handle.call({}, req, res, callback);
    }, function (err, result) {
        //err['isNormal']有值时，表明预料中的异常中断，有意不继续执行后续处理函数
        if (err && err['isNormal']) {
            callback(null, err.message);
            return;
        }

        if (err) {
            callback(err);
            return;
        }

        result = _.filter(result, function () {
            return !_.isEmpty(result);
        });

        callback(null, result);
    });
}