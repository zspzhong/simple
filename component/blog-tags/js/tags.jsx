require('!style!css!less!../css/tags.less');
var React = require('react');
var ReactDOM = require('react-dom');

exports.init = init;

var BlogTags = React.createClass({
    render: function () {
        return <div id='blog-tags'>
            {this.props.tags.map(function (item, index) {
                return <div key={index}>{item}</div>
            })}
        </div>;
    }
});

function init(ele, tags) {
    if (!ele) {
        return;
    }

    ReactDOM.render(<BlogTags tags={tags}/>, ele);
}