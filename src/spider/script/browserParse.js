/** 模拟浏览器环境渲染页面 */

var system = require('system');
var webPage = require('webpage');

var args = system.args;
var page = webPage.create();

if (args.length === 1) {
    phantom.exit();
}

var url = args[1] || "";

page.open(url, function (status) {
    if (status !== 'success') {
        console.log('<html></html>');
        phantom.exit();
    }

    console.log(page.content);
    phantom.exit();
});
