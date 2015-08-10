var nodeMailer = require('nodemailer');
var transporter = nodeMailer.createTransport();

exports.sendMail = sendMail;

function sendMail(options, callback) {
    var defaultOptions = {
        to: 'shasharoman@gmail.com',
        from: 'sha@me.com',
        subject: 'none'
    };

    transporter.sendMail(_.extend(defaultOptions, options), callback);
}