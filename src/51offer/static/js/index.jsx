import App from '../component/app/app.jsx';
import { requestNextPage } from '../component/app/appAction';
import configureStore from '../component/app/appStore';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import fetch from 'isomorphic-fetch';

const store = configureStore();

ReactDOM.render(<Provider store={store}>
    <App />
</Provider>, document.getElementById('root'));

store.dispatch(requestNextPage());