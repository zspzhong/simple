init();

var fs = require('fs');

var cheerio = require('cheerio');
var browserRequest = require(global.appSrcDir + "/browserRequest.js");

spiderStart();

function spiderStart() {
	var pageUrlList = ['https://500px.com/popular'];
	var imageSrcList = [];

	var writeStart = 0;
	var oneTimesWriteCount = 20;
	var urlLimit = 100;

	_initWorkerQueue();

	console.log('start ok!');

	function _initWorkerQueue() {
		var concurrency = 10;
		var queue = async.queue(_spiderOne, concurrency);

		queue.push('https://500px.com/popular');

		var start = new Date().getTime();
		queue.drain = function() {
			console.log('total url count: ' + pageUrlList.length);
			console.log('total image count: ' + imageSrcList.length);
			console.log('total cost time: ' + (new Date().getTime() - start));
		};
	}

	function _spiderOne(url, callback) {
		browserRequest.request(url, function (err, html) {
			if (err) {
				console.log(err);
				callback(err);
				return;
			}

			var parseResult = findLinkAndImg(url, html);

			imageSrcList = _.uniq(imageSrcList.concat(parseResult.image));

			var withoutRepeat = _.filter(parseResult.link, function (url) {
				return !_.contains(pageUrlList, url);
			});

			pageUrlList = pageUrlList.concat(withoutRepeat);

			if (pageUrlList.length <= urlLimit) {
				queue.push(withoutRepeat);
			}

			_writeResult2File();
			callback(null);
		});

		function _writeResult2File() {
			var writeEnd = writeStart + oneTimesWriteCount;
			if (imageSrcList.length < writeEnd) {
				return;
			}

			var readyToWrite = imageSrcList.slice(writeStart, writeEnd);

			fs.appendFileSync(global.appDir + '/output/result', readyToWrite.join('\n') + '\n');

			writeStart = writeEnd;

			console.log('write success, image count: ' + writeEnd);
		}
	}
}

function findLinkAndImg(url, html) {
	var $ = cheerio.load(html);

	var linkUrlList = [];
	var imageSrcList = [];

	_.each($('a'), function (item) {
		var href = _fillFull(item.attribs.href);

		if (href && _.contains(href, '500px')) {
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
}

function init() {
	require('./initSystemVar.js').init();
}