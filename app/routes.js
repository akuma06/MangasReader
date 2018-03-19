/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import ReaderPage from './containers/ReaderPage';

export default () => (
  <App>
    <Switch>
      <Route path="/reader" component={ReaderPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </App>
);
