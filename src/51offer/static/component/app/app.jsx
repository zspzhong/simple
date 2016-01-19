import './app.less';
import PlanList from './plan-list/planList.jsx';
import { fetchPlanSchool, requestPreviousPage, requestNextPage, switchSortOption } from '../app/appAction';

import React from 'react';
import { connect } from 'react-redux';

class App extends React.Component {
    render() {
        let dispatch = this.props.dispatch;

        return (<PlanList planList={this.props.planList}
                          page={this.props.page}
                          spreadOutPlan={(planId) => dispatch(fetchPlanSchool(planId))}
                          previousPage={() => dispatch(requestPreviousPage())}
                          nextPage={() => dispatch(requestNextPage())}
                          sortBy={(field) => dispatch(switchSortOption(field))}/>);
    }
}

function mapStateToProps(state) {
    return {
        planList: state.plan,
        page: state.page
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch: dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);