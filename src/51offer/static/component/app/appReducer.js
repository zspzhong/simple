import {
    REPLACE_PLAN_LIST,
    REQUEST_PLAN_SCHOOL,
    RECEIVE_PLAN_SCHOOL,
    TOGGLE_PLAN_SCHOOL_VISIBLE,
    CHANGE_PAGE_INDEX,
    CHANGE_SORT_OPTION
} from './appAction';

import fetch from 'isomorphic-fetch';
import { combineReducers } from 'redux';

function plan(state = [], action) {
    // 替换计划列表
    if (action.type === REPLACE_PLAN_LIST) {
        return [...action.planList];
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

            item.school = school;
            item.school.currentCateId = school.cateList[0].cateId;

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

function page(state = {}, action) {
    if (action.type === CHANGE_PAGE_INDEX) {
        return {
            index: action.index,
            size: state.size,
            maxIndex: state.maxIndex
        };
    }

    return state;
}

function sortOption(state = {field: 'id', way: 'desc'}, action) {
    if (action.type === CHANGE_SORT_OPTION) {
        return {
            field: action.field,
            way: action.way
        };
    }

    return state;
}

export default combineReducers({
    plan: plan,
    page: page,
    sortOption: sortOption
});
