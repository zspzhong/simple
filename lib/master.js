init();

function init() {
    require('./initSystemVar.js').init();

    require(global.srcDir + '/spider/spider.js').spiderStart();
}