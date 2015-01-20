init();

var fs = require('fs');

var cheerio = require('cheerio');
var browserRequest = require(global.appSrcDir + "/browserRequest.js");

spiderStart();

function spiderStart() {
	var pageUrlList = ['https://500px.com/popular'];
	var imageSrcList = [];

	var imgWriteStart = 0;
	var imgOneTimesWriteCount = 20;//每爬取到多少个img记录一次

	var urlWriteStart = 0;
	var urlOneTimesWriteCount = 50;//每爬取到多少个url记录一次
	var urlLimit = 100;//url爬取上限

	var currentSpiderIndex = 0;
	var spiderCounterCircle = 0;//爬取循环计数器
	var spiderUrlOneTimesCount = 5;//分析多少个url记录一次，用于支持续爬

	var queue = null;

	_initWorkerQueue();

	console.log('start ok!');

	function _initWorkerQueue() {
		var concurrency = 10;
		queue = async.queue(_spiderOne, concurrency);

		queue.push('https://500px.com/popular');

		queue.drain = function() {
			var imgReadyToWrite = imageSrcList.slice(imgWriteStart);
			fs.appendFileSync(global.appDir + '/output/image', imgReadyToWrite.join('\n') + '\n');

			var urlReadyToWrite = pageUrlList.slice(urlWriteStart);
			fs.appendFileSync(global.appDir + '/output/url', urlReadyToWrite.join('\n') + '\n');

			console.log('spider done');
		};
	}

	function _spiderOne(url, callback) {
		console.log('spider ' + url + ' start');
		browserRequest.request(url, function (err, html) {
			console.log('spider ' + url + ' end');

			if (err) {
				console.error(err);
				callback(err);
				return;
			}

			_extractFromHtml(url, html);

			_writeResult2File();
			_writeUrl2File();
			_writeProcess2File();

			callback(null);
		});

		function _extractFromHtml(url, html) {
			var parseResult = findLinkAndImg(url, html);

			imageSrcList = _.uniq(imageSrcList.concat(parseResult.image));

			var withoutRepeat = _.filter(parseResult.link, function (url) {
				return !_.contains(pageUrlList, url);
			});

			pageUrlList = pageUrlList.concat(withoutRepeat);

			if (pageUrlList.length <= urlLimit) {
				queue.push(withoutRepeat);
			}
		}

		function _writeResult2File() {
			var writeEnd = imgWriteStart + imgOneTimesWriteCount;
			if (imageSrcList.length < writeEnd) {
				return;
			}

			var imgReadyToWrite = imageSrcList.slice(imgWriteStart, writeEnd);
			fs.appendFileSync(global.appDir + '/output/image', imgReadyToWrite.join('\n') + '\n');

			imgWriteStart = writeEnd;

			console.log('write success, image count: ' + writeEnd);
		}

		function _writeUrl2File() {
			var writeEnd = urlWriteStart + urlOneTimesWriteCount;

			if (pageUrlList.length < writeEnd) {
				return;
			}

			var urlReadyToWrite = pageUrlList.slice(urlWriteStart, writeEnd);
			fs.appendFileSync(global.appDir + '/output/url', urlReadyToWrite.join('\n') + '\n');

			urlWriteStart = writeEnd;

			console.log('write success, url count: ' + writeEnd);
		}

		function _writeProcess2File() {
			currentSpiderIndex++;
			spiderCounterCircle++;

			if (spiderCounterCircle % spiderUrlOneTimesCount !== 0) {
				return;
			}

			var processStr = JSON.stringify({
				current: currentSpiderIndex,
				totalImgCount: imageSrcList.length,
				totalUrlCount: pageUrlList.length
			});


			fs.writeFileSync(global.appDir + '/output/process', processStr);

			console.log('write success, process: ' + processStr);
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