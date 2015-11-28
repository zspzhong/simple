var logger = global.logger;
var exec = require('child_process').exec;

exports.gitWebHook = gitWebHook;

function gitWebHook(req, res, callback) {
    var gitPull = exec('git pull origin master', {cwd: '/root/simple'}, function (err) {
        gitPull.kill('SIGHUP');
        if (err) {
            logger.error(err);
            callback(err);
            return;
        }

        logger.info('git pull 执行成功');
        callback(null);
    });
}