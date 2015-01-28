exports.spiderStart = spiderStart;

var cheerio = require('cheerio');
var browserRequest = require(global.srcDir + "/spider/browserRequest.js");
var spiderDao = require(global.srcDir + "/spider/spiderDao.js");

var alreadySpider = 0;//本次已爬取url数量
var oneTimesSpiderLimit = 5000;//每次url爬取队列上限

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
	var queue = async.queue(spiderOne, concurrency);

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

	async.series([_isRepeat, _spider, _url2Persistence, _image2Persistence], function(err) {
		if (err) {
			callback(err);
			return;
		}

		if (!isRepeat) {
			alreadySpider++;
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

			imageList = parseResult.image;
			urlList = parseResult.url;


			if (alreadySpider < oneTimesSpiderLimit) {
				queue.push(urlList);
			}

			callback(null);
		});
	}

	function _url2Persistence(callback) {
		if (_.isEmpty(urlList)) {
			callback(null);
			return;
		}

		spiderDao.addUrlIgnoreRepeat(urlList, callback);
	}

	function _image2Persistence(callback) {
		if (_.isEmpty(imageList)) {
			callback(null);
			return;
		}

		spiderDao.addImageIgnoreRepeat(imageList, callback);
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
		link: linkUrlList,
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

