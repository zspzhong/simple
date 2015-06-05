var url = require('url');
var fs = require('fs');
var urlMatch = require('./pathRouter.js');

exports.register = register;
exports.remove = remove;
exports.handleRequest = handleRequest;

function register(path, method, fun) {
    // 所有注册的服务都加上svc前缀
    urlMatch.addHandleOfPath('/svc' + path, method, fun);
}

function remove(path, method) {
    urlMatch.removeHandleOfPath(path, method);
}

function handleRequest(req, res, callback) {
    var handleList = urlMatch.queryHandleOfUrl(req.url, req.method);

    if (!_.isArray(handleList)) {
        handStaticResource(req, res);
        callback(null, {noNeedResponse: true});
        return;
    }

    async.mapSeries(handleList, function (handle, callback) {
        handle.call({}, req, res, callback);
    }, function (err, result) {
        // err['isNormal']有值时，表明预料中的异常中断，有意不继续执行后续处理函数
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

        if (result.length === 1) {
            callback(null, result[0]);
            return;
        }

        callback(null, result);
    });
}

// 只在开发状态需要处理静态资源，部署后由nginx处理
function handStaticResource(req, res) {
    if (global['mode'] !== 'dev') {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end();
        return;
    }

    var realPath = _transPathWithDev(url.parse(req.url).pathname);

    fs.exists(realPath, function (exists) {
        if (!exists) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write('this page is not find in this server.');
            res.end();
            return;
        }

        fs.readFile(realPath, 'binary', function (err, file) {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end(err);
                return;
            }

            res.writeHead(200);
            res.write(file, 'binary');
            res.end();
        });
    });

    function _transPathWithDev(pathname) {
        var pathArray = pathname.split('/');
        pathArray.splice(0, 1, '/dev');

        return global['rootDir'] + pathArray.join('/')
    }
}