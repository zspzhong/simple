require(process.cwd() + '/lib/utils/globalExtend.js');

var fs = require('fs');
var glob = require('glob');
var jade = require('jade');
var _ = require('lodash');
var cheerio = require('cheerio');

exports.indexData = indexData;

function indexData(callback) {
    var indexList = [];
    var src = process.cwd() + '/src/blog/static/**/*.jade';

    glob(src, function (err, files) {
        if (err) {
            callback(err);
            return;
        }

        _.each(files, function (item) {
            if (_.contains(item, 'static/index.jade')) {
                return;
            }

            indexList.push(_getInfo(item));
        });

        indexList = _.sortBy(indexList, function (item) {
            return -(new Date(item.time).getTime());
        });

        callback(null, indexList);
    });

    function _getInfo(filePath) {
        var html = jade.renderFile(filePath);
        var $ = cheerio.load(html);

        var link = '/blog' + filePath.split('static')[1].replace('jade', 'html');
        var title = $(':header:first-child').text();
        var time = fs.statSync(filePath).ctime;
        var preview = $('p').text().replace(/(\n\r)|(\n)/g, ' ').substring(0, 120) + '...';

        return {
            link: link,
            title: title,
            time: time.format('yyyy-MM-dd hh:mm'),
            preview: preview
        };
    }
}
