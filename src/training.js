// 用于遇到实验性代码写在这支用用node跑看输出

var fs = require('fs');
var _ = require('lodash');

var imgPath = './url';

if (!fs.existsSync(imgPath)) {
    return;
}

var imageContent = fs.readFileSync(imgPath).toString();

var imageList = imageContent.split('\n');

var noRepeat = _.uniq(imageList);

//var repeat = _.filter(imageList, function (item) {
//    var firstIndex = _.findIndex(imageList, function (one) {
//        return one === item;
//    });
//
//    var lastIndex = _.findLastIndex(imageList, function (one) {
//        return one === item;
//    });
//
//    return firstIndex !== lastIndex;
//});

console.log(imageList.length);
console.log(noRepeat.length);


