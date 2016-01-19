import './app.less';
import PlanList from './plan-list/planList.jsx';
import { fetchPlanSchool, requestPreviousPage, requestNextPage } from '../app/appAction';

import React from 'react';
import { connect } from 'react-redux';

class App extends React.Component {
    render() {
        return (<PlanList planList={this.props.planList}
                          spreadOutPlan={(planId) => this.props.dispatch(fetchPlanSchool(planId))}
                          previousPage={() => this.props.dispatch(requestPreviousPage())}
                          nextPage={() => this.props.dispatch(requestNextPage())}/>);
    }
}

function mapStateToProps(state) {
    return {
        planList: state.school,
        page: state.page
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch: dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);