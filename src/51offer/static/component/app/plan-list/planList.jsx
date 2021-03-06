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
            <div>{item.grade_in_school}</div>
            <div>{item.grade_gpa}</div>
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
                <div onClick={() => {this.props.sortBy('hope_in_country')}}
                     className='hand-point'>
                    想去国家
                </div>
                <div onClick={() => {this.props.sortBy('grade_in_school')}}
                     className='hand-point'>
                    在读学校
                </div>
                <div onClick={() => {this.props.sortBy('grade_gpa')}}
                     className='hand-point'>
                    GPA
                </div>
                <div onClick={() => {this.props.sortBy('grade_in_major')}}
                     className='hand-point'>
                    在读专业
                </div>
                <div>希望就读专业</div>
                <div>希望就读学位</div>
                <div>院校数量</div>
                <div>
                    <div>
                        {this.props.page.index + 1}/{this.props.page.maxIndex + 1}
                    </div>
                    <div>
                        <span onClick={() => {this.props.previousPage()}}>上一页</span>
                        <span onClick={() => {this.props.nextPage()}}>下一页</span>
                    </div>
                </div>
            </div>

            {listItemWhitDetail}
        </div>);
    }
}