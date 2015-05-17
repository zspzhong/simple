exports.run = run;

var request = require('request');
var fs = require('fs');
var downloadDao = require('./downloadDao.js');
var logger = global.logger;
var alreadyDownload = 0;

function run() {
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
        async.eachLimit(imageList, 1, downloadOne, function (err) {
            if (err) {
                logger.error(err);
                return;
            }

            // 第二轮下载
            run();
        });
    });
}

function downloadOne(image, callback) {
    var isImage = false;
    var errorHappen = false;

    var imageByte = 0;

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
                logger.error(err);
                errorHappen = true;
                callback(null);
                return;
            }

            if (response.statusCode === 200) {
                isImage = (_.contains(response.headers['content-type'], 'image'));

                if (isImage) {
                    imageByte = response.headers['content-length'];
                }
            }
            callback(null);
        });
    }

    function _download(callback) {
        if (!isImage) {
            callback(null);
            return;
        }

        if (errorHappen) {
            callback(null);
            return;
        }

        var downloadRequest = request.get({
            url: image.image_url,
            timeout: 120000
        });

        downloadRequest.on('response', function (res) {
            if (res.statusCode !== 200) {
                errorHappen = true;
                callback(null);
                return;
            }

            callback(null);
        });
        downloadRequest.on('error', function (err) {
            if (err) {
                logger.error(err);
                errorHappen = true;
            }
        });
        downloadRequest.pipe(fs.createWriteStream(global['rootDir'] + '/output/' + image.id));
    }

    function _markDownload(callback) {
        if (errorHappen) {
            downloadDao.markDownloadError(image.image_url, callback);
            return;
        }

        if (!isImage) {
            downloadDao.markIsNotImage(image.image_url, callback);
            return;
        }

        downloadDao.markImageDownload(image.image_url, imageByte, callback);
    }
}
