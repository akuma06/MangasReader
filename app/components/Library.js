// @flow
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Library.css';
import { GetBooks, Book, EraseBook } from '../utils/Database';
import LinkBook from './LinkBook';
import Pagination from './Pagination';

type P = {};

type S = {
  books: Array<Book>,
  total: number,
  page: number
};

const perpage = 50;

class Library extends Component<P, S> {
  state = {
    books: [],
    total: 0,
    page: 0
  };

  componentDidMount() {
    this.getPageHandler();
  }

  componentDidUpdate(prevProps: P, prevState: S) {
    if (prevState.page !== this.state.page) this.getPageHandler(this.state.page);
  }

  eraseBook(id: string) {
    EraseBook(id, () => {
      const { books } = this.state;
      books.forEach((v: Book, ind: number) => {
        if (v._id === id) {
          books.splice(ind, 1);
          this.setState({ books });
        }
      });
    });
  }

  getPageHandler(page: number = 0) {
    GetBooks(
      (results: Array<Book>) => {
        this.setState({ books: results.slice(page * perpage, (page + 1) * perpage), page, total: results.length });
      },
      {
        selector: {
          name: { $gte: null }
        },
        sort: [{ name: 'asc' }]
      }
    );
  }
  onPageChangeHandler(page: number) {
    this.setState({ page });
  }

  render() {
    return (
      <div className={styles.container}>
        <h1>Library</h1>
        <ul className={styles.listbook}>
          {this.state.books.map((book: Book, ind) => (
            <LinkBook key={`linkb_${book._id}`} book={book} pair={(ind % 2) === 0} onerase={this.eraseBook.bind(this)} />
          ))}
        </ul>
        <div className={styles.center}>
          <Pagination
            onchange={this.onPageChangeHandler.bind(this)}
            currentPage={this.state.page}
            items={this.state.total}
            perpage={perpage}
          />
        </div>
        <div>
          <Link to="/"><button>Accueil</button></Link>
        </div>
      </div>
    );
  }
}

export default Library;
