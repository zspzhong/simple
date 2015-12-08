var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

exports.run = run;

function run() {
    var html = '<html></html>';

    var url = 'http://www.51offer.com/lp/register_10.html';
    var options = {
        url: url
    };

    request.get(options, function (err, res, body) {
        if (err) {
            console.log(err);
            return;
        }

        html = body;
        var rankList = _transData();
        fs.writeFileSync(global['rootDir'] + '/output/university_rank.json', new Buffer(JSON.stringify(rankList), 'utf8'), {encoding: 'utf8'});
    });

    function _transData() {
        var rankList = [];
        var headers = ['2016Rank', '2015Rank', 'trend', 'name', 'studentSatisfaction', 'researchQuality', 'ucasEntryPoints', 'graduateProspects', 'firsts', 'completionRate', 'studentStaffRatio', 'services'];

        var $ = cheerio.load(html);

        _.each($('table tbody tr'), function (item) {
            var oneUniversity = [];
            _.each(item.children, function (one, index) {
                if (one.type === 'text') {
                    return;
                }

                if (index === 9 || index === 27) {
                    return;
                }


                var text = $(one).text();
                if (index === 5) {
                    if (text === '-') {
                        text = 'equal';
                    }
                    else {
                        // 图片表示上升下降
                        var imgSrc = one.children[0].attribs.src || '';
                        text = _.contains(imgSrc, 'lp_red_top') ? 'up' : 'down';
                    }
                }

                oneUniversity.push(text);
            });

            rankList.push(oneUniversity)
        });

        return _.map(rankList, function (item) {
            var obj = {};
            _.each(item, function (one, index) {
                obj[headers[index]] = one;
            });
            return obj;
        });
    }
}