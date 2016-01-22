require('./initSystemValue').init();

var app = require('./expressInit').init();

require('./devSupport').init(app);
require(global['libDir'] + '/app-manage/appManage').startAllApp(app);

// error handle
app.use(function (err, req, res, next) {
    if (err) {
        res.end(JSON.stringify(err));
    }
});