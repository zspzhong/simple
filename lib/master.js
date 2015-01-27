init();

function init() {
    require('./initSystemVar.js').init();

    require(global.srcDir + '/spider/spider.js').init();
    //require(global.srcDir + '/download/download.js').init();
}