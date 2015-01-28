init();

function init() {
    require('./initSystemVar.js').init();

    require(global.srcDir + '/spider/spider.js').spiderStart();
    //require(global.srcDir + '/download/download.js').init();
}