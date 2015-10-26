var path = require('path');
var logger = global.logger;
var application = require('./application.js');

exports.startAllApp = startAllApp;

function startAllApp() {
    var appList = global['applicationList'];

    _.each(appList, function (item) {
        startApp(item);

        logger.info(item + ' 启动完成');
    });

    global.express.listen(global['port']);

    logger.info('所有app启动完成');
}

function startApp(appName) {
    var appMetaPath = path.join(global['srcDir'], appName, 'meta-info.json');

    new application(appName, appMetaPath).start();
}