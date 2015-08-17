init();

function init() {
    require('./initSystemValue.js').init();
    require(global['srcDir'] + '/' + global.app).run();
}