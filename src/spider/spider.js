exports.spiderStart = spiderStart;

var cheerio = require('cheerio');
var uuid = require('uuid');
var browserRequest = require(global.srcDir + "/spider/browserRequest.js");
var spiderDao = require(global.srcDir + "/spider/spiderDao.js");

var alreadySpider = 0;//本次已爬取url数量
var oneTimesSpiderLimit = 5000;//每次url爬取队列上限

var queue = null;

function spiderStart() {
	spiderDao.querySpiderUrl(function (err, result) {
		if (err) {
			console.log(err);
			return;
		}

		if (_.isEmpty(result)) {
			console.log("无可爬取链接");
			return;
		}

		spiderUrlList(result);
	});
}

function spiderUrlList(urlList) {
	var concurrency = 10;
	queue = async.queue(spiderOne, concurrency);

	queue.push(urlList);

	queue.drain = function () {
		console.log('spider done');
	};

	console.log('start ok!');
}

function spiderOne(url, callback) {
	var isRepeat = false;

	var imageList = [];
	var urlList = [];

	async.series([_isRepeat, _spider, _url2Persistence, _image2Persistence, _markUrlSpider], function(err) {
		if (err) {
			console.error(err);
			callback(err);
			return;
		}

		if (!isRepeat) {
			alreadySpider++;
		}

		if (!_.isEmpty(urlList) && alreadySpider < oneTimesSpiderLimit) {
			queue.push(urlList);
		}

		if (alreadySpider % 10 === 0) {
			console.log("已爬取: " + alreadySpider);
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
				console.error(err);
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
				init_url: global.initUrl,
				source_url: url,
				spider_status: 0
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

		_.each(imageList, function(item) {
			imageObjList.push({
				id: uuid.v1(),
				image_url: item,
				init_url: global.initUrl,
				source_url: url,
				download_status: 0
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

		if (src && _isImgSrcPass(src)) {
			imageSrcList.push(src);
		}
	});

	return {
		url: linkUrlList,
		image: imageSrcList
	};

	// 补齐相对路径的url
	function _fillFull(aUrl) {
		if (!aUrl) {
			return;
		}

		if (!_.contains(aUrl, 'http')) {
			aUrl = url + aUrl;
		}

		return aUrl;
	}

	// 根据配置的urlWhiteList判断是否通过该url
	function _isUrlPass(aUrl) {
		var flag = _.isEmpty(global.urlWhiteList);

		_.each(global.urlWhiteList, function (item) {
			if (_.contains(aUrl, item)) {
				flag = true;
			}
		});

		return flag;
	}

	function _isImgSrcPass(imgSrc) {
		var flag = _.isEmpty(global.imgWhiteList);

		_.each(global.imgWhiteList, function (item) {
			if (_.contains(imgSrc, item)) {
				flag = true;
			}
		});

		return flag;
	}
}

