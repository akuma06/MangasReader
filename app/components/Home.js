// @flow
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { remote } from 'electron';
import { OpenDirectory, ImportDirectory } from '../utils/OpenDirectory';
import { GetBooks, AddBook, Book, EraseBooks, EraseBook } from '../utils/Database';
import styles from './Home.css';
import { history } from '../store/configureStore';
import { initializeSettings } from '../settings';
import LinkBook from './LinkBook';

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
    initializeSettings();
    document.title = 'Accueil - Mangas Reader';
    GetBooks((books: Array<Book>) => {
      this.setState({ books });
    });
  }
  eraseDB() {
    remote.dialog.showMessageBox({
      type: 'question',
      buttons: ['Oui', 'Annuler'],
      cancelId: 1,
      message: 'Voulez-vous vraiment tout effacer ?'
    }, (resp) => {
      if (resp === 0) {
        EraseBooks(() => {
          this.setState({ books: [] });
        });
      }
    });
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
  render() {
    return (
      <div className={styles.container} data-tid="container">
        <div>
          <h2>
            Accueil
            <span className={styles.right}>
              <Link to="/settings">
                <i className="fa fa-cog" />
              </Link>
            </span>
          </h2>
          <h4>Derniers chapitres</h4>
          <ul className={styles.listbook}>
            {this.state.books.map((book: Book, ind) => (
              <LinkBook key={`linkb_${book._id}`} book={book} pair={(ind % 2) === 0} onerase={this.eraseBook.bind(this)} />
              ))}
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
            <Link to="/library">
              <button>
              Library
              </button>
            </Link>
            <button onClick={this.eraseDB.bind(this)}>
              <i className="fa fa-trash" />
              Delete all
            </button>
          </div>
        </div>
      </div>
    );
  }
}

