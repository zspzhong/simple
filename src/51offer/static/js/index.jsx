import App from '../component/app/app.jsx';
import { requestNextPage } from '../component/app/appAction';
import configureStore from '../component/app/appStore';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import fetch from 'isomorphic-fetch';

const pageSize = 50;

fetch('/svc/51offer/allPlanCount')
    .then(res => res.json())
    .then(json => {
        const store = configureStore({
            plan: [],
            page: {
                index: -1,
                size: pageSize,
                maxIndex: Math.ceil((json.result / pageSize) - 1)
            }
        });

        ReactDOM.render(<Provider store={store}>
            <App />
        </Provider>, document.getElementById('root'));

        store.dispatch(requestNextPage());
    });