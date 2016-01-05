import './catalog.less';

import React from 'react';

export default class Catalog extends React.Component {
    render() {
        return <ul id='catalog'>
            {this.props.catalog.map(function (item, index) {
                return <CatalogItem key={index}
                                    time={item.time}
                                    title={item.title}
                                    link={item.link}
                                    preview={item.preview}/>;
            })}
        </ul>;
    }
}

class CatalogItem extends React.Component {
    render() {
        return <li className='catalog-item'>
            <div className='title'>
                <span className='time'>{this.props.time}</span>
                <a href={this.props.link} target='_blank'>{this.props.title}</a>
            </div>
            <div className='preview'>
                {this.props.preview}
            </div>
        </li>;
    }
}