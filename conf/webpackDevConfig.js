var config = {
    resolve: {
        root: [process.cwd() + '/node_modules'] // 可配全局library目录
    },
    context: process.cwd() + '/src',
    entry: {
        'blog/js/blog.js': './blog/static/js/blog.js',
        '51offer/js/index.js': './51offer/static/js/index.jsx'
    },
    output: {
        path: process.cwd() + '/dev',
        filename: '[name]'
    },
    module: {
        loaders: [
            {test: /\.less$/, loaders: ['style', 'css', 'less']},
            {test: /(\.jsx$)|(\.js$)/, loaders: ['babel?presets[]=react&presets[]=es2015']}
        ]
    }
};

module.exports = config;