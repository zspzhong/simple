var fs = require('fs');
var glob = require('glob');
var jade = require('jade');
var _ = require('lodash');
var cheerio = require('cheerio');

exports.generate = generate;

generate(function (err, result) {
    console.log(result);
});

function generate(callback) {
    var indexList = [];

    glob('static/**/*.jade', function (err, files) {
        if (err) {
            callback(err);
            return;
        }

        _.each(files, function (item) {
            if (_.contains(['static/index.jade'], item)) {
                return;
            }

            indexList.push(_getInfo(item));
        });

        indexList = _.sortBy(indexList, function (item) {
            return new Date(item.time).getTime();
        });

        callback(null, indexList);
    });

    function _getInfo(filePath) {
        var html = jade.renderFile(filePath);
        var $ = cheerio.load(html);

        var link = filePath.replace('static', '').replace('.jade', '.html');
        var title = $(':header:first-child').text();
        var time = fs.statSync(filePath).ctime;
        var preview = $('p').text().replace(/(\n\r)|(\n)/g, ' ').substring(0, 120) + '...';

        return {
            link: link,
            title: title,
            time: _formatDate(time),
            preview: preview
        };
    }

    function _formatDate(date) {
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
    }
}
