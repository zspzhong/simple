var mailUtils = require(global['libDir'] + '/utils/mailUtils.js');

exports.run = run;

function run() {
    mailUtils.sendMail({
        text: 'hello world!'
    }, function (err) {
        if (err) {
            console.log(err);
        }

        process.exit(0);
    });
}