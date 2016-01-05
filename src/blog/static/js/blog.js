import blog from '../component/blog/blog.jsx';
import catalog from './blogCatalog.js';

import hl from 'highlight.js';

var data = {
    head: {
        title: 'Am Simple\'s Blog',
        slogan: 'It looks hard, it\'s harder than it looks'
    },
    content: {
        catalog: catalog,
        tags: ['gulp', 'webpack', 'node', 'react', 'html', 'css', 'http']
    }
};

blog(document.getElementById('blog-index'), data);
hl.initHighlightingOnLoad();