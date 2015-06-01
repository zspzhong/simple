var logger = global.logger;
var imageDao = require('./imageDao.js');

exports.randomUrl = randomUrl;

var imageCount = Math.ceil(100000 * Math.random());
var imageUrlPool = [];
initImageCountAsync();

function randomUrl(req, res, callback) {
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
        imageDao.queryImageUrl(randomOffset, 50, function (err, result) {
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
    imageDao.queryImageCount(function (err, count) {
        if (err) {
            logger.error(err);
            return;
        }

        imageCount = count;
    });
}