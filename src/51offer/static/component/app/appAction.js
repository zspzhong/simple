export const ADD_PLAN_LIST = 'ADD_PLAN_LIST';
export const REQUEST_PLAN_SCHOOL = 'FETCH_PLAN_SCHOOL';
export const RECEIVE_PLAN_SCHOOL = 'RECEIVE_PLAN_SCHOOL';
export const TOGGLE_PLAN_SCHOOL_VISIBLE = 'TOGGLE_PLAN_SCHOOL_VISIBLE';

import fetch from 'isomorphic-fetch';

export function addPlanList(planList) {
    return {
        type: ADD_PLAN_LIST,
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

        if (!_shouldFetch(getState(), planId)) {
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

export function receivePlanSchool(school) {
    return {
        type: RECEIVE_PLAN_SCHOOL,
        school: school
    };
}