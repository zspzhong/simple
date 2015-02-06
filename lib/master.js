init();

function init() {
    require('./initSystemVar.js').init();

    if (global.app === 'spider') {
        require(global.srcDir + '/spider/spider.js').spiderStart();
    }

    if (global.app === 'download') {
        require(global.srcDir + '/download/download.js').startDownload();
    }
}