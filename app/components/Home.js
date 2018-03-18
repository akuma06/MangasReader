// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { OpenDirectory, ImportDirectory } from '../utils/OpenDirectory';
import { GetBooks, AddBook } from '../utils/Database';
import styles from './Home.css';
import { history } from '../store/configureStore';

type Props = {};

function openDir() {
  OpenDirectory((folderPath) => {
    AddBook(folderPath);
    history.push('/reader', { folderPath });
  });
}
function importDir() {
  ImportDirectory((folderPath) => {
    AddBook(folderPath);
    history.push('/reader', { folderPath });
  });
}
export default class Home extends Component<Props> {
  props: Props;

  state = {
    books: []
  }
  componentDidMount() {
    GetBooks((books) => {
      this.setState({ books });
    });
  }
  render() {
    return (
      <div className={styles.container} data-tid="container">
        <div>
          <h2>Accueil</h2>
          <h4>Derniers chapitres</h4>
          <ul>
            {this.state.books.map((book) => (
              <li key={book.id}>
                <Link to={{ pathname: '/reader', state: { folderPath: book.folderPath } }}>{book.title}</Link>
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
          </div>
        </div>
      </div>
    );
  }
}

