require('./initSystemValue.js').init();

var expressInit = require('./expressInit.js');
var path = require('path');
var appManage = require(path.join(global['libDir'], 'appManage/appManage.js'));

expressInit.initExpress();
appManage.startAllApp();