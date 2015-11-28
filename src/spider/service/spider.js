var logger = global.logger;
var spiderDao = require('./spiderDao.js');

exports.imageUrl = imageUrl;

var imageCount = Math.ceil(100000 * Math.random());
var imageUrlPool = [];

initImageCountAsync();

function imageUrl(req, res, callback) {
    callback(null, imageUrlPool.pop() || '');

    _fillPool(function (err) {
        if (err) {
            logger.error(err);
        }
    });

    function _fillPool(callback) {
        if (imageUrlPool.length > 100) {
            callback(null);
            return;
        }

        var randomOffset = Math.ceil(Math.random() * imageCount);
        spiderDao.queryImageUrl(randomOffset, 50, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            imageUrlPool = (result || []).concat(imageUrlPool);
            callback(null);
        });
    }
}

function initImageCountAsync() {
    spiderDao.queryImageCount(function (err, count) {
        if (err) {
            logger.error(err);
            return;
        }

        imageCount = count;
    });
}