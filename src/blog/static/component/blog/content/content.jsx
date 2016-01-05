import './content.less';

import Catalog from './catalog/catalog.jsx';
import Tags from './tags/tags.jsx';

import React from 'react';
import ReactDOM from 'react-dom';


export default class Content extends React.Component {
    render() {
        return (<div id='content'>
            <Catalog catalog={this.props.content.catalog}/>
            <Tags tags={this.props.content.tags}/>
        </div>);
    }
}