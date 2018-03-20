// @flow
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { OpenDirectory, ImportDirectory } from '../utils/OpenDirectory';
import { GetBooks, AddBook, Book, EraseBooks } from '../utils/Database';
import styles from './Home.css';
import { history } from '../store/configureStore';

type Props = {};
type State = {
  books: Array<Book>
};

function openDir() {
  OpenDirectory((folderPath: string) => {
    AddBook(folderPath, () => history.push('/reader', { open: folderPath }));
  });
}
function importDir() {
  ImportDirectory((folderPath: string) => {
    AddBook(folderPath, () => history.push('/reader', { open: folderPath }));
  });
}
export default class Home extends Component<Props, State> {
  props: Props;

  state = {
    books: []
  }
  componentDidMount() {
    document.title = 'Accueil - Mangas Reader';
    GetBooks((books: Array<Book>) => {
      this.setState({ books });
    });
  }
  eraseDB() {
    EraseBooks(() => {
      this.setState({ books: [] });
    });
  }
  render() {
    return (
      <div className={styles.container} data-tid="container">
        <div>
          <h2>Accueil</h2>
          <h4>Derniers chapitres</h4>
          <ul>
            {this.state.books.map((book: Book) => (
              <li key={book._id}>
                <Link key={`link_${book._id}`} to={{ pathname: '/reader', state: { open: book.folderPath } }}>{book.title}</Link>
              </li>))}
          </ul>
          <div className={styles.navbuttons}>
            <button onClick={openDir}>
              <i className="fa fa-folder-open" />
            Ouvrir...
            </button>
            <button onClick={importDir}>
              <i className="fa fa-plus-square" />
            Importer Volume...
            </button>
            <button onClick={this.eraseDB.bind(this)}>
              <i className="fa fa-trash" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

