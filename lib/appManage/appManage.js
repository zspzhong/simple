var path = require('path');
var logger = global.logger;
var application = require('./application.js');

exports.startAllApp = startAllApp;
exports.stopAllApp = stopAllApp;
exports.reloadAllApp = reloadAllApp;

var appName2App = {};

function startAllApp() {
    var appList = global['applicationList'];

    _.each(appList, function (item) {
        startApp(item);

        logger.info(item + ' 启动完成');
    });

    logger.info('所有app启动完成');
}

function stopAllApp() {
    var appList = global['applicationList'];

    _.each(appList, function (item) {
        stopApp(item);
    });
}

function reloadAllApp() {
    var appList = global['applicationList'];

    _.each(appList, function (item) {
        reloadApp(item);
    });
}

function startApp(appName) {
    if (!_.isEmpty(appName2App[appName])) {
        appName2App[appName].start();
        return;
    }

    var appMetaPath = path.join(global['srcDir'], appName, 'meta-info.json');
    appName2App[appName] = new application(appName, appMetaPath);
    appName2App[appName].start();
}

function stopApp(appName) {
    if (_.isEmpty(appName2App[appName])) {
        return;
    }

    appName2App[appName].stop();
}

function reloadApp(appName) {
    if (_.isEmpty(appName2App[appName])) {
        return;
    }

    appName2App[appName].reload();
}