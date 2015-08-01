exports.querySpiderUrl = querySpiderUrl;
exports.isUrlHasBeenSpider = isUrlHasBeenSpider;
exports.addUrlIgnoreRepeat = addUrlIgnoreRepeat;
exports.addImageIgnoreRepeat = addImageIgnoreRepeat;
exports.markUrlSpider = markUrlSpider;

var dataUtils = require(global['libDir'] + '/dao/dataUtils.js');

function querySpiderUrl(callback) {
    var condition = {
        spider_status: 0,
        limit: [0, 50000]
    };

    dataUtils.query('spider_url', condition, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (_.isEmpty(result)) {
            callback(null, [global['initUrl']]);
            return;
        }

        callback(null, _.pluck(result, 'url'));
    });
}

function isUrlHasBeenSpider(url, callback) {
    dataUtils.query('spider_url', {url: url, spider_status: 1}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, !_.isEmpty(result));
    });
}

function addUrlIgnoreRepeat(urlObjList, callback) {
    dataUtils.listIgnore2DB('spider_url', urlObjList, callback);
}

function addImageIgnoreRepeat(imageObjList, callback) {
    dataUtils.listIgnore2DB('image_url', imageObjList, callback);
}

function markUrlSpider(url, callback) {
    var updateModel = {
        url: url,
        spider_status: 1
    };

    dataUtils.updateObj2DB('spider_url', updateModel, 'url', callback);
}