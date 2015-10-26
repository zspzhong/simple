var path = require('path');
var fs = require('fs');
var router = require(path.join(global['libDir'], 'router/router.js'));

module.exports = Application;

function Application(appName, metaPath, expressApp) {
    this.appName = appName;
    this.metaPath = metaPath;
    this.expressApp = expressApp;
    this.metaInfo = JSON.parse(fs.readFileSync(this.metaPath));
}

Application.prototype.start = function () {
    this.loadInitial();
    this.loadService();
};

Application.prototype.loadInitial = function () {
    var that = this;

    var initialInfo = this.metaInfo['initial'];
    if (_.isEmpty(initialInfo)) {
        return;
    }

    var realizeJs = require(path.join(global['srcDir'], that.appName, 'initial', initialInfo['realizeJs']));
    var realizeFunction = realizeJs[initialInfo['functionName']];

    realizeFunction(that.expressApp);
};

Application.prototype.loadService = function () {
    var that = this;

    _.each(this.metaInfo['serviceList'], function (item) {
        var realizeJs = require(path.join(global['srcDir'], that.appName, 'service', item['realizeJs']));
        var realizeFunction = realizeJs[item['functionName']];

        var serviceInfo = {
            path: item['path'],
            method: item['method'],
            realizeFunction: realizeFunction,
            oauth: item['oauth']
        };

        router.register(serviceInfo, that.expressApp);
    });
};