require('./initSystemValue.js').init();

var path = require('path');
var appManage = require(path.join(global['libDir'], 'appManage/appManage.js'));

appManage.startAllApp();