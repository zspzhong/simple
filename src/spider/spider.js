exports.run = run;

var cheerio = require('cheerio');
var uuid = require('uuid');
var urlModule = require('url');
var browserRequest = require(global['srcDir'] + "/spider/browserRequest.js");
var spiderDao = require(global['srcDir'] + "/spider/spiderDao.js");
var logger = global.logger;
var queueLength = 0;//队列长度
var alreadySpider = 0;//本次已爬取url数量
var oneTimesSpiderLimit = 10000;//每次url爬取队列上限
var recordDetailInfo = false;

var queue = null;

function run() {
    spiderDao.querySpiderUrl(function (err, result) {
        if (err) {
            logger.info(err);
            return;
        }

        if (_.isEmpty(result)) {
            logger.info("no spider url");
            return;
        }

        spiderUrlList(result);
        queueLength = result.length;
    });
}

function spiderUrlList(urlList) {
    var concurrency = 5;
    queue = async.queue(spiderOne, concurrency);

    queue.push(urlList);

    queue.drain = function () {
        logger.info('spider done');
    };

    logger.info('start ok, wait to spider url count ' + urlList.length);
}

function spiderOne(url, callback) {
    var isRepeat = false;

    var imageList = [];
    var urlList = [];

    async.series([_isRepeat, _spider, _url2Persistence, _image2Persistence, _markUrlSpider], function (err) {
        if (err) {
            logger.error(err);
            callback(err);
            return;
        }

        if (!_.isEmpty(urlList) && queueLength < oneTimesSpiderLimit) {
            queue.push(urlList);
            queueLength += urlList;
        }

        if (!isRepeat) {
            alreadySpider++;
        }

        if (recordDetailInfo) {
            logger.info(url);
            logger.info('imageList: ', imageList);
            logger.info('urlList: ', urlList);
        }

        if (alreadySpider % 100 === 0) {
            logger.info('already spider url count ' + alreadySpider);
        }

        callback(null);
    });

    function _isRepeat(callback) {
        spiderDao.isUrlHasBeenSpider(url, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            isRepeat = result;
            callback(null);
        });
    }

    function _spider(callback) {
        if (isRepeat) {
            callback(null);
            return;
        }

        browserRequest.request(url, function (err, html) {
            if (err) {
                logger.error(err);
                callback(err);
                return;
            }

            var parseResult = findLinkAndImg(url, html);

            imageList = _.uniq(parseResult.image);
            urlList = _.uniq(parseResult.url);

            callback(null);
        });
    }

    function _url2Persistence(callback) {
        if (_.isEmpty(urlList)) {
            callback(null);
            return;
        }

        var urlObjList = [];

        _.each(urlList, function (item) {
            urlObjList.push({
                id: uuid.v1(),
                url: item,
                init_url: global['initUrl'],
                source_url: url,
                spider_status: 0,
                image_count: imageList.length,
                insert_time: new Date().getTime()
            });
        });

        spiderDao.addUrlIgnoreRepeat(urlObjList, callback);
    }

    function _image2Persistence(callback) {
        if (_.isEmpty(imageList)) {
            callback(null);
            return;
        }

        var imageObjList = [];

        _.each(imageList, function (item) {
            imageObjList.push({
                id: uuid.v1(),
                image_url: item,
                init_url: global['initUrl'],
                source_url: url,
                download_status: 0,
                image_status: 1,
                insert_time: new Date().getTime()
            });
        });

        spiderDao.addImageIgnoreRepeat(imageObjList, callback);
    }

    function _markUrlSpider(callback) {
        if (isRepeat) {
            callback(null);
            return;
        }

        spiderDao.markUrlSpider(url, callback);
    }
}

function findLinkAndImg(url, html) {
    var $ = cheerio.load(html);

    var linkUrlList = [];
    var imageSrcList = [];

    _.each($('a'), function (item) {
        var href = _fillFull(item.attribs.href);

        if (href && _isUrlPass(href)) {
            linkUrlList.push(href);
        }
    });

    _.each($('img'), function (item) {
        var src = _fillFull(item.attribs.src);

        if (src) {
            imageSrcList.push(src);
        }
    });

    return {
        url: linkUrlList,
        image: imageSrcList
    };

    // 补齐相对路径的url
    function _fillFull(aUrl) {
        if (!aUrl || _.indexOf(aUrl, '#') === 0) {
            return;
        }

        if (aUrl.indexOf('//') === 0) {
            aUrl = urlModule.parse(url).protocol + aUrl;
        }

        if (!_.contains(aUrl, 'http')) {
            aUrl = urlModule.resolve(url, aUrl);
        }

        return aUrl;
    }

    // 根据配置的urlWhiteList判断是否通过该url
    function _isUrlPass(aUrl) {
        var flag = _.isEmpty(global['urlWhiteList']);

        _.each(global['urlWhiteList'], function (item) {
            if (_.contains(aUrl, item)) {
                flag = true;
            }
        });

        return flag;
    }
}