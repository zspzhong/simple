import Head from './head/head.jsx';
import Content from './content/content.jsx';

import React from 'react';
import ReactDOM from 'react-dom';

class Blog extends React.Component {
    render() {
        return (<div id='blog'>
            <Head head={this.props.data.head}/>
            <Content content={this.props.data.content}/>
        </div>);
    }
}

export default function blog(ele, data) {
    if (!ele) {
        return;
    }

    ReactDOM.render(<Blog data={data}/>, ele);
}