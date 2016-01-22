var path = require('path');
var logger = global.logger;
var Application = require('./application');

exports.startAllApp = startAllApp;

function startAllApp(expressApp) {
    var appList = global['applicationList'];

    _.each(appList, function (item) {
        startApp(item, expressApp);

        logger.info(item + ' 启动完成');
    });

    expressApp.listen(global['port']);

    logger.info('所有app启动完成');
}

function startApp(appName, expressApp) {
    var appMetaPath = path.join(global['srcDir'], appName, 'meta-info.json');

    new Application(appName, appMetaPath, expressApp).start();
}