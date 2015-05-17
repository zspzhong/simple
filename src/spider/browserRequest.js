var childProcess = require('child_process');
var logger = global.logger;

exports.request = request;

function request(url, callback) {
	var args = ['--load-images=false', global['srcDir'] + '/spider/browserParse.js', url];
	var child = childProcess.spawn('phantomjs', args);

	var html = "";

	child.stdout.on('data', function (data) {
		html += data;
	});

	child.on('exit', function () {
		callback(null, html);
	});

	child.on('error', callback);
}
