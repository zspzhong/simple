exports.insertUrlIgnoreRepeat = insertUrlIgnoreRepeat;
exports.isUrlHasBeenSpider = isUrlHasBeenSpider;
exports.insertImageIgnoreRepeat = insertImageIgnoreRepeat;

var mysql = require(global.libDir + "/dao/mysql.js");

function insertUrlIgnoreRepeat(urlList, callback) {
    callback(null);
}

function isUrlHasBeenSpider(url, callback) {
    callback(null, false);
}

function insertImageIgnoreRepeat(imageList, callback) {
    callback(null);
}

