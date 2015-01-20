var fs = require('fs');

exports.init = init;

function init() {
    global._ = require('lodash');
    global.async = require('async');

    initConfig();
}

function initConfig() {
    var terminalArg = _parseArg();

    if (terminalArg.config) {
        var config = JSON.parse(fs.readFileSync(terminalArg.config));

        _.extend(terminalArg, config);
    }

    global.appDir = terminalArg.appDir;
    global.appSrcDir = terminalArg.appSrcDir;
    global.mode = terminalArg.mode;

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