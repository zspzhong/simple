init();

function init() {
    require('./initSystemValue.js').init();
    require(global.appDir + global.app).run();
}