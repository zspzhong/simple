init();

var fs = require('fs');

var cheerio = require('cheerio');
var browserRequest = require(global.appSrcDir + "/browserRequest.js");

var pageUrlList = [global.initUrl];
var imageSrcList = [];

var imgWriteStart = 0;
var imgOneTimesWriteCount = 500;//每爬取到多少个img记录一次

var urlWriteStart = 0;
var urlOneTimesWriteCount = 5000;//每爬取到多少个url记录一次
var urlLimit = 5000;//url爬取队列上限

var currentSpiderIndex = 0;
var spiderCounterCircle = 0;//爬取循环计数器
var spiderUrlOneTimesCount = 200;//分析多少个url记录一次，用于支持续爬


resumeProcess();
spiderStart();

function init() {
	require('./initSystemVar.js').init();
}

function resumeProcess() {
	_resumeUrl();
	_resumeImg();
	_resumeIndex();

	function _resumeUrl() {
		var urlPath = global.appDir + '/output/url';

		if (!fs.existsSync(urlPath)) {
			return;
		}

		var previousUrlContent = fs.readFileSync(urlPath).toString();
		if (!_.isEmpty(previousUrlContent)) {
			pageUrlList = previousUrlContent.split('\n');
			pageUrlList.splice(pageUrlList.length - 1);

			urlWriteStart = pageUrlList.length;

			console.log('resume url count ' + pageUrlList.length);
		}
	}

	function _resumeImg() {
		var imgPath = global.appDir + '/output/image';

		if (!fs.existsSync(imgPath)) {
			return;
		}

		var previousImgContent = fs.readFileSync(imgPath).toString();
		if (!_.isEmpty(previousImgContent)) {
			imageSrcList = previousImgContent.split('\n');
			imageSrcList.splice(imageSrcList.length - 1);

			imgWriteStart = imageSrcList.length;

			console.log('resume img count ' + imageSrcList.length);
		}
	}

	function _resumeIndex() {
		var processPath = global.appDir + '/output/process';

		if (!fs.existsSync(processPath)) {
			return;
		}

		var previousProcess = JSON.parse(fs.readFileSync(processPath));
		if (!_.isElement(previousProcess)) {
			currentSpiderIndex = previousProcess.current;

			spiderCounterCircle = currentSpiderIndex % spiderUrlOneTimesCount;

			console.log('resume spider index from ' + currentSpiderIndex);
		}
	}
}

function spiderStart() {
	var queue = null;

	_initWorkerQueue();

	console.log('start ok!');

	function _initWorkerQueue() {
		var concurrency = 10;
		queue = async.queue(_spiderOne, concurrency);

		console.log("queue start from " + currentSpiderIndex);

		queue.push(pageUrlList.splice(currentSpiderIndex));

		queue.drain = function() {
			var imgReadyToWrite = imageSrcList.slice(imgWriteStart);

			if (!_.isEmpty(imgReadyToWrite)) {
				fs.appendFileSync(global.appDir + '/output/image', imgReadyToWrite.join('\n') + '\n');
			}

			var urlReadyToWrite = pageUrlList.slice(urlWriteStart);

			if (!_.isEmpty(urlReadyToWrite)) {
				fs.appendFileSync(global.appDir + '/output/url', urlReadyToWrite.join('\n') + '\n');
			}

			var processStr = JSON.stringify({
				current: currentSpiderIndex,
				urlCount: urlWriteStart,
				imgCount: imgWriteStart
			});

			fs.writeFileSync(global.appDir + '/output/process', processStr);

			console.log('spider done');
		};
	}

	function _spiderOne(url, callback) {
		browserRequest.request(url, function (err, html) {
			if (err) {
				console.error(err);
				callback(err);
				return;
			}

			_extractFromHtml(url, html);

			_writeUrl2File();
			_writeImage2File();
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

		function _writeUrl2File() {
			if (pageUrlList.length - urlWriteStart > urlOneTimesWriteCount) {
				return;
			}

			var urlReadyToWrite = pageUrlList.slice(urlWriteStart);
			fs.appendFileSync(global.appDir + '/output/url', urlReadyToWrite.join('\n') + '\n');

			urlWriteStart = pageUrlList.length;

			console.log('write success, url count ' + pageUrlList.length);
		}

		function _writeImage2File() {
			if (imageSrcList.length - imgWriteStart > imgOneTimesWriteCount) {
				return;
			}

			var imgReadyToWrite = imageSrcList.slice(imgWriteStart);
			fs.appendFileSync(global.appDir + '/output/image', imgReadyToWrite.join('\n') + '\n');

			imgWriteStart = imageSrcList.length;

			console.log('write success, image count ' + imageSrcList.length);
		}

		function _writeProcess2File() {
			currentSpiderIndex++;
			spiderCounterCircle++;

			if (spiderCounterCircle % spiderUrlOneTimesCount !== 0) {
				return;
			}

			var processStr = JSON.stringify({
				current: currentSpiderIndex,
				urlCount: urlWriteStart,
				imgCount: imgWriteStart
			});

			fs.writeFileSync(global.appDir + '/output/process', processStr);

			if (pageUrlList.length > urlWriteStart) {
				var urlReadyToWrite = pageUrlList.slice(urlWriteStart);
				fs.appendFileSync(global.appDir + '/output/url', urlReadyToWrite.join('\n') + '\n');

				urlWriteStart = pageUrlList.length;
			}

			if (imageSrcList.length > imgWriteStart) {
				var imgReadyToWrite = imageSrcList.slice(urlWriteStart);

				fs.appendFileSync(global.appDir + '/output/image', imgReadyToWrite.join('\n') + '\n');
			}

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

