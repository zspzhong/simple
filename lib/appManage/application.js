var path = require('path');
var fs = require('fs');
var router = require(path.join(global['libDir'], 'router/router.js'));

module.exports = application;

function application(appName, metaPath) {
    this.appName = appName;
    this.metaPath = metaPath;
    this.metaInfo = JSON.parse(fs.readFileSync(this.metaPath));

    transRouterInfo(appName, this.metaInfo);
}

application.prototype.start = function () {
    var metaInfo = this.metaInfo;

    _.each(metaInfo['serviceList'], function (item) {
        var routerInfo = item.routerInfo;
        if (_.isEmpty(routerInfo)) {
            return;
        }

        router.register(routerInfo);
    });
};

application.prototype.stop = function () {
    var metaInfo = this.metaInfo;

    _.each(metaInfo['serviceList'], function (item) {
        var routerInfo = item.routerInfo;
        if (_.isEmpty(routerInfo)) {
            return;
        }

        router.remove(routerInfo);
    });
};

application.prototype.reload = function () {
    this.stop();

    this.metaInfo = JSON.parse(fs.readFileSync(this.metaPath));
    transRouterInfo(this.appName, this.metaInfo);

    this.start();
};

function transRouterInfo(appName, metaInfo) {
    _.each(metaInfo['serviceList'], function (item) {
        var aPath = item['path'];
        var realizeJs = require(path.join(global['srcDir'], appName, 'service', item['realizeJs']));
        var realizeFunction = realizeJs[item['functionName']];
        var method = item['method'];

        item.routerInfo = {
            path: aPath,
            method: method,
            realizeFunction: realizeFunction
        };
    });
}