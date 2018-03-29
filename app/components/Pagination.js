import React, { Component } from 'react';
import styles from './Pagination.css';

type P = {
  currentPage: number,
  items: number,
  perpage: number,
  onchange: (page: number) => void
};

class Pagination extends Component<P> {
  state = {}

  getLinks() {
    const links = [];
    if (this.props.currentPage > 0) {
      links.push(<a href="#" key="page_prev" onClick={this.prevHandler.bind(this)}>&laquo;</a>);
    }

    const nbpages = Math.ceil(this.props.items / this.props.perpage);
    for (let i = 0; i < nbpages; i += 1) {
      const className = (i === this.props.currentPage) ? styles.active : '';
      links.push(<a href="#" key={`page_${i}`} onClick={this.onChangeHandler.bind(this)} data-page={i} className={className}>{i + 1}</a>);
    }

    if (this.props.currentPage < (nbpages - 1)) {
      links.push(<a href="#" key="page_next" onClick={this.nextHandler.bind(this)}>&raquo;</a>);
    }
    return links;
  }

  onChangeHandler(e) {
    e.preventDefault();
    const p = parseInt(e.target.dataset.page, 10);
    this.props.onchange(p);
  }

  nextHandler(e) {
    e.preventDefault();
    this.props.onchange(this.props.currentPage + 1);
  }

  prevHandler(e) {
    e.preventDefault();
    this.props.onchange(this.props.currentPage - 1);
  }

  render() {
    return (
      <div className={styles.pagination}>
        {this.getLinks()}
      </div>
    );
  }
}

export default Pagination;
