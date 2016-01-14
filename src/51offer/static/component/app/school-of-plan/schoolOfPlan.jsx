import './schoolOfPlan.less';

import React from 'react';

var CateItem = React.createClass({
    getInitialState: function () {
        return {
            active: this.props.active
        };
    },

    render: function () {
        let cate = this.props.cate;

        return (<div className={this.props.active ? 'active' : ''}
                     onClick={() => this.props.selectCate(this.props.cate.cateId)}>
            {cate.degreeName}-{cate.cateName}({cate.count})
        </div>)
    }
});

var SchoolList = React.createClass({
    render: function () {
        let cateId2School = this.props.cateId2School;
        let school = cateId2School[this.props.currentCateId] || [];

        return (<div className='school'>
            <div className='school-item'>
                <div>中文名</div>
                <div>英文名</div>
            </div>

            {school.map(item => <div className='school-item' key={item.id}>
                <div>{item.c_name}</div>
                <div>{item.e_name}</div>
            </div>)}
        </div>);
    }
});

export default React.createClass({
    getInitialState: function () {
        return {currentCateId: ''};
    },

    render: function () {
        let self = this;
        let school = this.props.school;

        if (!school || !school.visible) {
            return <div></div>;
        }

        let cateList = school.cateList;
        let cateId2SchoolList = school.cateId2SchoolList;

        return (<div className='item-detail'>
            <div className='filter'>
                {cateList.map((item, index) => <CateItem key={item.cateId} cate={item}
                                                         active={self.state.currentCateId === item.cateId || (!self.state.currentCateId && index === 0)}
                                                         selectCate={(cateId) => this.setState({currentCateId: cateId})}/>)}
            </div>

            <SchoolList cateId2School={cateId2SchoolList}
                        currentCateId={this.state.currentCateId || cateList[0].cateId}/>
        </div>);
    }
});