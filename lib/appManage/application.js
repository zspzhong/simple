var path = require('path');
var fs = require('fs');
var router = require(path.join(global['libDir'], 'router/router.js'));

module.exports = application;

function application(appName, metaPath) {
    //this.appName = appName;
    //this.metaPath = metaPath;
    this.metaInfo = JSON.parse(fs.readFileSync(metaPath));

    _.each(this.metaInfo['serviceList'], function (item) {
        var realizeJs = require(path.join(global['srcDir'], appName, 'service', item['realizeJs']));
        var realizeFunction = realizeJs[item['functionName']];

        item.serviceInfo = {
            path: item['path'],
            method: item['method'],
            realizeFunction: realizeFunction,
            oauth: item['oauth']
        };
    });
}

application.prototype.start = function () {
    var metaInfo = this.metaInfo;

    _.each(metaInfo['serviceList'], function (item) {
        var serviceInfo = item.serviceInfo;
        if (_.isEmpty(serviceInfo)) {
            return;
        }

        router.register(serviceInfo);
    });
};