require('./initSystemValue').init();

var app = require('./expressInit').init();

require('./devSupport').init(app);
require(global['libDir'] + '/appManage/appManage').startAllApp(app);

// error handle
app.use(function (err, req, res, next) {
    if (err) {
        res.end(JSON.stringify(err));
    }
});