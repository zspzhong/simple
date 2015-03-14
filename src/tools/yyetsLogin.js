var request = require('request');

var options = {
    url:'http://www.zimuzu.tv/User/Login/ajaxLogin',
    form: {
        account: 'shasharoman',
        password: '888888',
        from: 'loginpage'
    }
};

request.post(options, function(err, res, body) {
    if (err) {
        console.log(err);
        return;
    }

    var result = JSON.parse(body);
    console.log(result);
});