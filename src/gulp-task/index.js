var gulp = require('gulp');
var runSequence = require('run-sequence');

require('./clean.js');
require('./less.js');
require('./jade.js');
require('./html.js');
require('./js.js');
require('./serverJade.js');
require('./blogIndex.js');
require('./copy.js');

gulp.task('build', function (callback) {
    runSequence('clean-all', ['less-build', 'jade-build', 'html-build', 'js-build', 'server-jade-copy', 'blog-build'], callback);
});

gulp.task('dev', function (callback) {
    runSequence('build', 'copy', 'server-jade-dev', 'html-dev', callback);
});

gulp.task('default', function (callback) {
    runSequence('build', 'copy', 'server-jade', 'html', 'clean-build', callback);
});

gulp.task('blog-dev', function (callback) {
    runSequence(['less-build', 'jade-build', 'html-build', 'blog-build'], 'html-dev', callback);
});

gulp.task('watch', function () {
    gulp.watch('src/blog/**/*', ['blog-dev']);
});