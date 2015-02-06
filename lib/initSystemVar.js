var fs = require('fs');

exports.init = init;

function init() {
    global._ = require('lodash');
    global.async = require('async');
    global.logger = require('./logger.js');

    initConfig();
}

function initConfig() {
    var terminalArg = _parseArg();

    if (terminalArg.config) {
        var config = JSON.parse(fs.readFileSync(terminalArg.config));

        _.extend(terminalArg, config);
    }

    //_.extend(global, terminalArg);

    global.config = config;

    global.appDir = terminalArg.appDir;
    global.srcDir = terminalArg.srcDir;
    global.libDir = terminalArg.libDir;
    global.mode = terminalArg.mode;
    global.initUrl = terminalArg.initUrl;
    global.urlWhiteList = terminalArg.urlWhiteList;
    global.imgWhiteList = terminalArg.imgWhiteList;

    function _parseArg() {
        var result = {};

        var parseRule = {
            '-c': 'config',
            '-d': 'appDir',
            '-m': 'mode'
        };

        var arg = process.argv;
        _.each(arg, function (item, index) {
            if (!_.contains(item, '-') || _.isEmpty(parseRule[item])) {
                return;
            }

            result[parseRule[item]] = arg[index + 1];
        });

        return result;
    }
}