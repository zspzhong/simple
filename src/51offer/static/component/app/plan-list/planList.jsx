import './planList.less';
import SchoolOfPlan from '../school-of-plan/schoolOfPlan.jsx';

import React from 'react';

class Item extends React.Component {
    render() {
        let item = this.props.item;
        let cateList = [];
        for (let key in item.cateCount) {
            cateList.push({
                cate: key,
                count: item.cateCount[key]
            });
        }

        return (<div className='list-item'>
            <div>{item.hope_in_country}</div>
            <div>{item.current_grade}</div>
            <div>{item.grade_in_major}</div>
            <div>{item.hope_in_major}</div>
            <div>{item.degree_title}</div>
            <div>
                {cateList.map((item, index) => {
                    return <div key={index}>{item.cate}:{item.count}</div>;
                })}
            </div>
            <div onClick={() => {this.props.spreadOutPlan(item.id)}}>详情</div>
        </div>);
    }
}

export default class PlanList extends React.Component {
    render() {
        let listItem = this.props.planList.map(item => <Item key={item.id} item={item}
                                                             spreadOutPlan={this.props.spreadOutPlan}/>);
        let listItemWhitDetail = [];

        for (let index = 0; index < listItem.length; index++) {
            listItemWhitDetail[index * 2] = listItem[index];
            listItemWhitDetail[index * 2 + 1] = <SchoolOfPlan key={index} school={this.props.planList[index].school}/>;
        }

        return (<div id='list'>
            <div className='list-item'>
                <div>想去国家</div>
                <div>在读年级</div>
                <div>在读专业</div>
                <div>希望就读专业</div>
                <div>希望就读学位</div>
                <div>院校数量</div>
                <div></div>
            </div>

            {listItemWhitDetail}
        </div>);
    }
}