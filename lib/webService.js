var http = require('http');

require('./initSystemVar.js').init();

http.createServer(function (req, res) {
    res.end('no that page.');
}).listen(8888, '127.0.0.1');