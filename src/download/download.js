exports.startDownload = startDownload;

var request = require('request');
var fs = require('fs');
var downloadDao = require('./downloadDao.js');
var logger = global.logger;
var alreadyDownload = 0;

function startDownload() {
    downloadDao.queryDownloadImage(1000, function (err, imageList) {
        if (err) {
            logger.error(err);
            return;
        }

        if (_.isEmpty(imageList)) {
            logger.info('no image to download');
            return;
        }

        logger.info('start to download');
        async.eachLimit(imageList, 20, downloadOne, function (err) {
            if (err) {
                logger.error(err);
                return;
            }

            // 第二轮下载
            startDownload();
        });
    });
}

function downloadOne(image, callback) {
    var isImage = false;

    async.series([_isImage, _download, _markDownload], function (err) {
        if (err) {
            callback(err);
            return;
        }

        if (!isImage) {
            logger.info(image.image_url);
        }

        if (isImage) {
            alreadyDownload++;
        }

        if (alreadyDownload % 100 === 0) {
            logger.info('already download image count ' + alreadyDownload);
        }

        callback(null);
    });

    function _isImage(callback) {
        request.head(image.image_url, function (err, response) {
            if (err) {
                callback(err);
                return;
            }

            if (response.statusCode === 200) {
                isImage = (_.contains(response.headers['content-type'], 'image'));
            }
            callback(null);
        });
    }

    function _download(callback) {
        if (!isImage) {
            callback(null);
            return;
        }

        var downloadRequest = request.get(image.image_url);
        downloadRequest.on('response', function (res) {
            if (res.statusCode !== 200) {
                callback('fail request');
                return;
            }

            callback(null);
        });
        downloadRequest.on('error', callback);
        downloadRequest.pipe(fs.createWriteStream(global.appDir + '/output/' + image.id));
    }

    function _markDownload(callback) {
        if (!isImage) {
            callback(null);
            return;
        }

        downloadDao.markImageDownload(image.image_url, callback);
    }
}
