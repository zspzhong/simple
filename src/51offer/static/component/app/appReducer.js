import { ADD_PLAN_LIST, REQUEST_PLAN_SCHOOL, RECEIVE_PLAN_SCHOOL, TOGGLE_PLAN_SCHOOL_VISIBLE, receivePlanSchool } from './appAction';

import fetch from 'isomorphic-fetch';

export default function school(state = [], action) {
    // 添加计划列表
    if (action.type === ADD_PLAN_LIST) {
        return [...state, ...action.planList];
    }

    // 开始请求计划对应的学校
    if (action.type === REQUEST_PLAN_SCHOOL) {
        return state;
    }

    // 接收到计划对应的学校
    if (action.type === RECEIVE_PLAN_SCHOOL) {
        let school = action.school;

        return [...state].map(item => {
            if (item.id !== school.planId) {
                return item;
            }

            item.school = {
                currentCateId: school.cateList[0].cateId
            };

            for (var key in school) {
                item.school[key] = school[key];
            }
            //item.school = Object.assign({
            //    currentCateId: school.cateList[0].cateId
            //}, school);
            return item;
        });
    }

    // 切换计划对应学校的可见状态
    if (action.type === TOGGLE_PLAN_SCHOOL_VISIBLE) {
        let planId = action.planId;

        return [...state].map(item => {
            if (item.id !== planId) {
                return item;
            }

            if (item.school) {
                item.school.visible = !item.school.visible;
            }

            return item;
        });
    }

    return state;
}