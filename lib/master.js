init();

function init() {
    require('./initSystemVar.js').init();
    require(global.appDir + global.app).run();
}