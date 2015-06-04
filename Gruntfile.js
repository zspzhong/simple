module.exports = function (grunt) {
    var gruntConfig = {
        cssmin: {
            global: {
                files: {
                    'release/global/css/global.min.css': ['src/global/*.css']
                }
            },
            module: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ["**/static/css/*.css"],
                    dest: 'release',
                    ext: '.min.css',
                    rename: clipStaticPath
                }]
            }
        },
        htmlmin: {
            options: {
                removeComments: true,
                removeCommentsFromCDATA: true,
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true
            },
            module: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ["**/static/*.html"],
                    dest: 'release',
                    ext: '.html',
                    rename: clipStaticPath
                }]
            }
        },
        uglify: {
            global: {
                options: {
                    mangle: {
                        except: ['require', 'exports', 'module', 'window']
                    }
                },
                files: {
                    'release/global/js/global.min.js': ['src/global/*.js']
                }
            },
            module: {
                options: {
                    mangle: {
                        except: ['require', 'exports', 'module', 'window']
                    }
                },
                files:  [{
                    expand: true,
                    cwd: 'src',
                    src: ["**/static/js/*.js"],
                    dest: 'release',
                    ext: '.min.js',
                    rename: clipStaticPath
                }]
            }
        }
    };

    grunt.initConfig(gruntConfig);

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['cssmin', 'htmlmin', 'uglify']);
};

// 从src拷贝到部署目录时，去掉中间的static路径
function clipStaticPath(dest, src) {
    var arr = src.split("/");
    arr.splice(1, 1);
    var splicePath = arr.join("/");
    return dest + "/" + splicePath;
}