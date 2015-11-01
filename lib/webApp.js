require('./initSystemValue.js').init();

var expressInit = require('./expressInit.js');
var path = require('path');
var appManage = require(path.join(global['libDir'], 'appManage/appManage.js'));

expressInit.initExpress();
appManage.startAllApp(expressInit.app);

expressInit.app.use(function (err, req, res, next) {
    // error handle
    res.end(JSON.stringify(err));
});