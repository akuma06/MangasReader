// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './NavBar.css';

type Props = {
  onleft: () => void,
  onright: () => void,
  onexpand: () => void,
  onplus: () => void,
  onminus: () => void,
  onopenf: () => void,
  onopen: () => void
};

export default class Reader extends Component<Props> {
  props: Props;

  handleLeft(e) {
    this.props.onleft();
    e.stopPropagation();
  }

  handleRight(e) {
    this.props.onright();
    e.stopPropagation();
  }

  handleExpand(e) {
    this.props.onexpand();
    e.stopPropagation();
  }

  handlePlus(e) {
    this.props.onplus();
    e.stopPropagation();
  }

  handleMinus(e) {
    this.props.onminus();
    e.stopPropagation();
  }
  handleOpen(e) {
    this.props.onopen();
    e.stopPropagation();
  }
  handleOpenFolder(e) {
    this.props.onopenf();
    e.stopPropagation();
  }

  render() {
    return (
      <div className={styles.navbar}>
        <div className={styles.navcontent}>
          <Link to="/">
            <button>
              <i className="fa fa-home" />
            </button>
          </Link>
          <button onClick={this.handleOpen.bind(this)}>
            <i className="fa fa-folder-open" />
          </button>
          <button onClick={this.handleOpenFolder.bind(this)}>
            <i className="fa fa-plus-square" />
          </button>
          <span className={styles.separator}>&nbsp;</span>
          <button onClick={this.handleLeft.bind(this)}>
            <i className="fa fa-arrow-left" />
          </button>
          <button onClick={this.handleRight.bind(this)}>
            <i className="fa fa-arrow-right" />
          </button>
          <button onClick={this.handleExpand.bind(this)}>
            <i className="fa fa-expand" />
          </button>
          <button onClick={this.handleMinus.bind(this)}>
            <i className="fa fa-search-minus" />
          </button>
          <button onClick={this.handlePlus.bind(this)}>
            <i className="fa fa-search-plus" />
          </button>
          <span className={styles.separator}>&nbsp;</span>
          <Link to="/settings">
            <button>
              <i className="fa fa-cog" />
            </button>
          </Link>
        </div>
      </div>
    );
  }
}
