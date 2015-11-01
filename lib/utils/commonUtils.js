exports.isXhrRequest = isXhrRequest;
exports.transQuery2Str = transQuery2Str;

function isXhrRequest(req) {
    var xRequestedWith = req.headers['XRequestedWith'] || req.headers['x-requested-with'] || req.headers['X-Requested-With'];
    if (xRequestedWith && xRequestedWith.indexOf('XMLHttpRequest') !== -1) {
        return true;
    }

    return !!req.headers['xhr'];
}

function transQuery2Str(obj) {
    var pairs = [];

    _.each(obj, function (value, key) {
        pairs.push(key + '=' + value);
    });

    return pairs.join('&');
}