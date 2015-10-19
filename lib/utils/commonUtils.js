exports.isXhrRequest = isXhrRequest;

function isXhrRequest(req) {
    var xRequestedWith = req.headers['XRequestedWith'] || req.headers['x-requested-with'] || req.headers['X-Requested-With'];
    if (xRequestedWith && xRequestedWith.indexOf('XMLHttpRequest') !== -1) {
        return true;
    }

    return !!req.headers['xhr'];
}