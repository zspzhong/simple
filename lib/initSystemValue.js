var fs = require('fs');

require('./utils/globalExtend.js');

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

    _.extend(global, terminalArg);

    function _parseArg() {
        var result = {};

        var parseRule = {
            '-c': 'config',
            '-m': 'mode',
            '-a': 'app'
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

exports.init = init;