var hl = require('highlight.js');
var tags = require('blog-tags');

hl.initHighlightingOnLoad();

var blogTags = ['gulp', 'webpack', 'node', 'react', 'html', 'css', 'http'];
tags.init(document.getElementById('tags'), blogTags);