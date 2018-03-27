// @flow
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from "./LinkBook.css";
import { Book } from '../utils/Database';

type P = {
  book: Book,
  pair: boolean,
  onerase: (id: string) => void
};

class LinkBook extends Component<P> {
  onEraseHandler() {
    this.props.onerase(this.props.book._id);
  }

  render() {
    const className = (this.props.pair) ? `${styles.linkbook} ${styles.pair}` : `${styles.linkbook}`;
    return (
      <li key={this.props.book._id} className={className}>
       <Link key={`link_${this.props.book._id}`} to={{ pathname: '/reader', state: { open: this.props.book.folderPath } }}>{this.props.book.title}</Link>
       <span className={styles.right}>
        <button onClick={this.onEraseHandler.bind(this)}>
          <i className="fa fa-trash" />
        </button>
       </span>
      </li>
    );
  }
}

export default LinkBook;