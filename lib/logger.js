function info() {
    var args = Array.prototype.slice.call(arguments);
    args.splice(0, 0, new Date() + ': ');
    console.info.apply(null, args);
}

function error() {
    var args = Array.prototype.slice.call(arguments);
    args.splice(0, 0, new Date() + ': ');
    console.error.apply(null, args);
    console.trace.apply(null, []);
}

exports.info = info;
exports.error = error;