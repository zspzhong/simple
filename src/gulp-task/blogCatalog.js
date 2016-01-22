/** 生成blog目录数据 **/
var moment = require('moment');
var fs = require('fs');
var glob = require('glob');
var jade = require('jade');
var _ = require('lodash');
var cheerio = require('cheerio');
var gulp = require('gulp');
var rename = require('gulp-rename');
var gulpJade = require('gulp-jade');

gulp.task('blog-build', function () {
    var replaceStatic = rename(function (path) {
        path.dirname = path.dirname.replace('/static', '');
        return path;
    });

    return gulp.src('src/blog/static/index.jade', {base: process.cwd() + '/src'})
        .pipe(gulpJade())
        .pipe(replaceStatic)
        .pipe(gulp.dest('build/'));
});

gulp.task('blog-catalog', function (callback) {
    catalogData(function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        var blogIndex = 'export default ' + JSON.stringify(result) + ';';
        fs.writeFileSync(process.cwd() + '/src/blog/static/js/blogCatalog.js', new Buffer(blogIndex));
        callback(null);
    });
});

function catalogData(callback) {
    var indexList = [];
    var src = process.cwd() + '/src/blog/static/article/**/*.jade';

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

        var link = '.' + filePath.split('static')[1].replace('jade', 'html');
        var title = $(':header:first-child').text();
        var timeInPage = $('time').text();
        var time = (timeInPage ? new Date(timeInPage) : '') || fs.statSync(filePath).ctime;
        var preview = $('p').text().replace(/(\n\r)|(\n)/g, ' ').substring(0, 120) + '...';

        return {
            link: link,
            title: title,
            time: moment(time).format('YYYY-MM-DD hh:mm'),
            preview: preview
        };
    }
}