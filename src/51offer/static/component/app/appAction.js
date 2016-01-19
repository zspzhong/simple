export const REPLACE_PLAN_LIST = 'REPLACE_PLAN_LIST';
export const REQUEST_PLAN_SCHOOL = 'FETCH_PLAN_SCHOOL';
export const RECEIVE_PLAN_SCHOOL = 'RECEIVE_PLAN_SCHOOL';
export const TOGGLE_PLAN_SCHOOL_VISIBLE = 'TOGGLE_PLAN_SCHOOL_VISIBLE';
export const CHANGE_PAGE_INDEX = 'CHANGE_PAGE_INDEX';

import fetch from 'isomorphic-fetch';

export function replacePlanList(planList) {
    return {
        type: REPLACE_PLAN_LIST,
        planList: planList
    };
}

export function requestPlanSchool(planId) {
    return {
        type: REQUEST_PLAN_SCHOOL,
        planId: planId
    };
}

export function togglePlanSchoolVisible(planId) {
    return {
        type: TOGGLE_PLAN_SCHOOL_VISIBLE,
        planId: planId
    };
}

export function fetchPlanSchool(planId) {
    return (dispatch, getState) => {
        dispatch(requestPlanSchool(planId));

        if (!_shouldFetch(getState().school, planId)) {
            dispatch(togglePlanSchoolVisible(planId));
            return;
        }

        fetch('/svc/51offer/schoolOfPlan/' + planId)
            .then(res => res.json())
            .then(json => {
                dispatch(receivePlanSchool(json.result));
                dispatch(togglePlanSchoolVisible(planId));
            });
    };


    function _shouldFetch(planList, planId) {
        let flag = true;
        for (let item of planList) {
            if (item.id === planId && item.school) {
                flag = false;
                break;
            }
        }

        return flag;
    }
}

export function changePageIndex(index) {
    return {
        type: CHANGE_PAGE_INDEX,
        index: index
    }
}

export function requestPreviousPage() {
    return (dispatch, getState) => {
        var page = getState().page;
        if (page.index <= 0) {
            alert('当前已是第一页');
            return;
        }

        dispatch(changePageIndex(page.index - 1));

        fetch('/svc/51offer/planList?index=' + (page.index - 1) + '&size=' + page.size)
            .then(res => res.json())
            .then(json => dispatch(replacePlanList(json.result)));
    };
}

export function requestNextPage() {
    return (dispatch, getState) => {
        var page = getState().page;
        if (page.index >= page.maxIndex) {
            alert('当前已是最后页');
            return;
        }

        dispatch(changePageIndex(page.index + 1));

        fetch('/svc/51offer/planList?index=' + (page.index + 1) + '&size=' + page.size)
            .then(res => res.json())
            .then(json => dispatch(replacePlanList(json.result)));
    };
}

export function receivePlanSchool(school) {
    return {
        type: RECEIVE_PLAN_SCHOOL,
        school: school
    };
}