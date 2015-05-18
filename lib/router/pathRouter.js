var url = require('url');
var path2HandleListGroupByMethod = {};

exports.addHandleOfPath = addHandleOfPath;
exports.queryHandleOfUrl = queryHandleOfUrl;
exports.removeHandleOfPath = removeHandleOfPath;

function addHandleOfPath(path, method, handle) {
    if (_.isEmpty(path2HandleListGroupByMethod[method])) {
        path2HandleListGroupByMethod[method] = {};
    }

    if (_.isEmpty(path2HandleListGroupByMethod[method][path])) {
        path2HandleListGroupByMethod[method][path] = [];
    }

    path2HandleListGroupByMethod[method][path].push(handle);
}

function queryHandleOfUrl(aUrl, method) {
    var urlObj = url.parse(aUrl);

    if (_.isEmpty(path2HandleListGroupByMethod[method])) {
        return null;
    }

    if (!_.isEmpty(path2HandleListGroupByMethod[method][urlObj.pathname])) {
        return path2HandleListGroupByMethod[method][urlObj.pathname];
    }

    // 将path中 '/:xxx/' 替换成 '/:.*/' 用于正则匹配
    var path = _.find(_.keys(path2HandleListGroupByMethod[method]), function (path) {
        var matchReg = new RegExp(path.replace(/\/:.*\//g, '/.*/'), 'g');
        return matchReg.test(urlObj.pathname);
    });

    if (_.isEmpty(path)) {
        return null;
    }

    return path2HandleListGroupByMethod[method][path];
}

function removeHandleOfPath(path, method) {
    if (_.isEmpty(path2HandleListGroupByMethod[method])) {
        return;
    }

    path2HandleListGroupByMethod[method][path] = [];
}






