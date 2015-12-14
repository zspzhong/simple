require('!style!css!less!../css/tags.less');
var React = require('react');
var ReactDOM = require('react-dom');

exports.init = init;

var BlogTags = React.createClass({
    render: function () {
        return <div className="r-tags">
            {this.props.tags.map(function (item) {
                return <div>{item}</div>
                })}
        </div>;
    }
});

function init(ele, tags) {
    ReactDOM.render(<BlogTags tags={tags}/>, ele);
}