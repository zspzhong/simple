import './tags.less';

import React from 'react';

export default class Tags extends React.Component {
    render() {
        return <div id='tags'>
            {this.props.tags.map(function (item, index) {
                return <div key={index}>{item}</div>
            })}
        </div>;
    }
}