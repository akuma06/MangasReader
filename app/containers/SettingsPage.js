// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Settings from '../components/Settings';

type Props = {
  history: object
};

class SettingsPage extends Component<Props> {
  props: Props;

  render() {
    return (
      <Settings
        history={this.props.history}
      />
    );
  }
}

export default withRouter(SettingsPage);
