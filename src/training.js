var path = require('path');

console.log(new RegExp('/:image/randomUrl'.replace(/\/:.*\//g, '/:.*/'), 'g'))