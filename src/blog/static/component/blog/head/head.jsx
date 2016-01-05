import './head.less';

import React from 'react';

export default class Head extends React.Component {
    render() {
        return (<div id='head'>
            <h2>{this.props.head.title}</h2>
            <h4>{this.props.head.slogan}</h4>
        </div>);
    }
}