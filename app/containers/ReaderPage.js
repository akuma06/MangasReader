// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Reader from '../components/Reader';

type Props = {
  match: object,
  location: object,
  history: object
};

class ReaderPage extends Component<Props> {
  props: Props;

  render() {
    return (
      <Reader
        match={this.props.match}
        location={this.props.location}
        history={this.props.history}
      />
    );
  }
}

export default withRouter(ReaderPage);
