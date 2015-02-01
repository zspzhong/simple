exports.querySpiderUrl = querySpiderUrl;
exports.isUrlHasBeenSpider = isUrlHasBeenSpider;
exports.addUrlIgnoreRepeat = addUrlIgnoreRepeat;
exports.addImageIgnoreRepeat = addImageIgnoreRepeat;
exports.markUrlSpider = markUrlSpider;

var dataUtils = require(global.libDir + '/dao/dataUtils.js');

function querySpiderUrl(callback) {
    callback(null, ['http://huaban.com']);
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
    var urlList = _.pluck(urlObjList, 'url');

    async.series([_filterRepeat, _add2DB], callback);

    function _filterRepeat(callback) {
        dataUtils.subListOfList('spider_url', 'url', urlList, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            urlObjList = _.filter(urlObjList, function (item) {
                return !_.contains(result, item.url);
            });

            callback(null);
        });
    }

    function _add2DB(callback) {
        dataUtils.list2DB('spider_url', urlObjList, callback);
    }
}

function addImageIgnoreRepeat(imageObjList, callback) {
    var imageList = _.pluck(imageObjList, 'image_url');

    async.series([_filterRepeat, _add2DB], callback);

    function _filterRepeat(callback) {
        dataUtils.subListOfList('image_url', 'image_url', imageList, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            imageObjList = _.filter(imageObjList, function (item) {
                return !_.contains(result, item.image_url);
            });

            callback(null);
        });
    }

    function _add2DB(callback) {
        dataUtils.list2DB('image_url', imageObjList, callback);
    }
}

function markUrlSpider(url, callback) {
    var updateModel = {
        url: url,
        spider_status: 1
    };

    dataUtils.updateObj2DB('spider_url', updateModel, 'url', callback);
}