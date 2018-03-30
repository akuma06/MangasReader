import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Library from '../components/Library';

type P = {
  location: object
};

class LibraryPage extends Component<P> {
  render() {
    return (
      <Library search={this.props.location.search} />
    );
  }
}

export default withRouter(LibraryPage);
