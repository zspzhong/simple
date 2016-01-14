import './app.less';
import PlanList from './plan-list/planList.jsx';
import { fetchPlanSchool } from '../app/appAction';

import React from 'react';
import { connect } from 'react-redux';

class App extends React.Component {
    render() {
        return (<PlanList planList={this.props.planList}
                          spreadOutPlan={(planId) => this.props.dispatch(fetchPlanSchool(planId))}/>);
    }
}

function mapStateToProps(state) {
    return {
        planList: state
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch: dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);