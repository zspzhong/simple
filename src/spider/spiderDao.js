exports.addUrlIgnoreRepeat = addUrlIgnoreRepeat;
exports.isUrlHasBeenSpider = isUrlHasBeenSpider;
exports.addImageIgnoreRepeat = addImageIgnoreRepeat;
exports.querySpiderUrl = querySpiderUrl;


var mysql = require(global.libDir + "/dao/mysql.js");

function addUrlIgnoreRepeat(urlList, callback) {
    callback(null);
}

function isUrlHasBeenSpider(url, callback) {
    callback(null, false);
}

function addImageIgnoreRepeat(imageList, callback) {
    callback(null);
}

function querySpiderUrl(callback) {
    callback(null, ['http://huaban.com']);
}
