require('!style!css!less!../css/catalog.less');
var React = require('react');
var ReactDOM = require('react-dom');

exports.init = init;

var PreviewItem = React.createClass({
    render: function () {
        return <li className='r-item'>
            <div className='r-title'>
                <span className='r-time'>{this.props.time}</span>
                <a href={this.props.link} target='_blank'>{this.props.title}</a>
            </div>
            <div className='r-preview'>
                {this.props.preview}
            </div>
        </li>;
    }
});

var BlogPreview = React.createClass({
    render: function () {
        return <ul id='blog-catalog'>
            {this.props.blogList.map(function (item, index) {
                return <PreviewItem key={index}
                                    datetime={item.time}
                                    title={item.title}
                                    link={item.link}
                                    preview={item.preview}/>;
            })}
        </ul>;
    }
});

function init(ele, blogList) {
    ReactDOM.render(<BlogPreview blogList={blogList}/>, ele);
}