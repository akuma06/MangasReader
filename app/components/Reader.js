// @flow
import React, { Component } from 'react';
import { remote } from 'electron';
import styles from './Reader.css';
import { ReadDirectory, File } from '../utils/ReadDirectory';
import NavBar from './NavBar';
import ChapterNav from './ChapterNav';
import { OpenDirectory, ImportDirectory } from '../utils/OpenDirectory';
import { AddBook, UpdateRead, GetBook, Book } from '../utils/Database';

type Props = {
  location: object,
  history: object
};
type State = {
  files: Array<File>,
  index: number,
  chapter: number,
  indchapters: Array<number>,
  startX: number,
  startY: number,
  increment: number,
  images: Array,
  book: Book,
  zoom: number
};

export default class Reader extends Component<Props, State> {
  props: Props;

  state = {
    files: [],
    index: 0,
    chapter: 0,
    indchapters: [],
    startX: 0,
    startY: 0,
    increment: 1,
    images: [],
    book: {},
    zoom: 1
  };


  componentDidMount() {
    if (this.props.location.state.open !== undefined) {
      this.callbackAfterOpen(this.props.location.state.open);
    } else {
      this.handleReadDirectory();
    }
    document.body.addEventListener('keydown', this.keydownhandler.bind(this));
  }

  componentDidUpdate(prevProps, prevState) {
    if ((prevProps.location.state.folderPath === this.props.location.state.folderPath)
      && (this.state.chapter > 0
      || (this.state.index > 0 && this.state.chapter === 0))) {
      UpdateRead(this.props.location.state.folderPath, this.state.chapter, this.state.index);
    }
    if (prevProps.location.state.folderPath !== this.props.location.state.folderPath) {
      this.handleReadDirectory();
    }
    if (prevState.book.title !== this.state.book.title) {
      this.setTitle();
    }
  }


  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.keydownhandler.bind(this));
  }
  handleOpenDir() {
    OpenDirectory((folderPath) => this.callbackAfterOpen(folderPath));
  }

  handleImportDir() {
    ImportDirectory((folderPath) => this.callbackAfterOpen(folderPath));
  }

  setTitle() {
    const title: Array<string> = [];
    title.push(this.state.book.name || this.state.book.title);
    if (this.state.book.volume !== '') title.push('volume', this.state.book.volume);
    if (this.state.book.chapters !== '') title.push('chapter', this.state.book.chapters);
    document.title = `${title.join(' ')} - Mangas Reader`;
  }

  callbackAfterOpen(folderPath: string) {
    AddBook(folderPath);
    GetBook(folderPath, (book) => {
      let chapter = 0;
      let index = 0;
      if (book !== undefined) {
        this.setState({ book });
        if (book.reading !== undefined) {
          ({ index, chapter } = book.reading);
        }
      }
      this.props.history.push('/reader', { folderPath, chapter, index });
    });
  }

  handleReadDirectory() {
    ReadDirectory(this.props.location.state.folderPath, (f?: Array<File>) => {
      const files: Array<File> = (f !== undefined) ? f : [];
      let notchapters = false;
      const indchapters: Array<number> = [];
      const l = files.length;
      for (let i = 0; i < l; i += 1) {
        if (files[i].type === 'img') {
          notchapters = true;
        } else {
          indchapters.push(i);
        }
      }
      if (!notchapters) {
        this.setState({ files, indchapters });
      } else {
        this.setState({ files });
      }
      const index = (this.props.location.state.index) ? this.props.location.state.index : 0;
      const chapter = (this.props.location.state.chapter) ? this.props.location.state.chapter : 0;
      this.setIndex(index, chapter);
    });
  }
  getImages() {
    switch (this.state.images.length) {
      case 2:
        return (
          <div className={styles.dualviewer}>
            <img
              src={this.state.images[0].src}
              alt={this.state.images[0].filename}
              width={this.state.images[0].width * this.state.zoom}
              height={this.state.images[0].height * this.state.zoom}
            />
            <img
              src={this.state.images[1].src}
              alt={this.state.images[1].filename}
              width={this.state.images[1].width * this.state.zoom}
              height={this.state.images[1].height * this.state.zoom}
            />
          </div>
        );
      case 1:
        return (
          <div className={styles.soloviewer}>
            <img
              src={this.state.images[0].src}
              alt={this.state.images[0].filename}
              width={this.state.images[0].width * this.state.zoom}
              height={this.state.images[0].height * this.state.zoom}
            />
          </div>
        );
      default:
        return (
          <p>End of chapter</p>
        );
    }
  }

  setIndex(index: number, ch: ?number, z: ?number) {
    let { files } = this.state;
    const chapter: number = (ch !== undefined) ? ch : this.state.chapter;

    if (this.state.indchapters.length > 0) {
      if (this.state.files[chapter] === undefined) return;
      ({ files } = this.state.files[chapter]);
      if (files === undefined) return;
    }
    if (files.length === 0) return;

    const zoom = (z !== undefined) ? z : this.state.zoom;
    const fimg = files[index];
    const rfimg = fimg.width / fimg.height;
    const reader = document.getElementById('reader');
    const divW = reader.offsetWidth;
    const divH = reader.offsetHeight;
    if ((rfimg < 1) && (index + 1 < files.length)) {
      const simg = files[index + 1];
      const rsimg = simg.width / simg.height;
      if (rsimg < 1) {
        const totalW = (fimg.width * zoom) + (simg.width * zoom) + 10;
        const totalH = Math.max(fimg.height, simg.height) * zoom;
        const startX = (divW - totalW) / 2;
        const startY = (divH - totalH) / 2;
        this.setState({
          increment: 2, startX, startY, index, zoom, chapter, images: [fimg, simg]
        });
        return;
      }
    }
    if (index < files.length) {
      const startX = (divW - (fimg.width * zoom)) / 2;
      const startY = (divH - (fimg.height * zoom)) / 2;
      this.setState({
        increment: 1, startX, startY, index, chapter, zoom, images: [fimg]
      });
    }
  }

  moveImages(e) {
    const reader = document.getElementById('reader');
    const divImages = document.getElementsByClassName(styles.container)[0];
    const divW = reader.offsetWidth;
    const divH = reader.clientHeight;
    const mouse = {
      X: ((e.clientX - (10 * ((divW - e.clientX) / divW))) / divW) * 2,
      Y: ((e.clientY - (10 * ((divH - e.clientY) / divH))) / divH) * 2
    };
    if (this.state.startX < 0) {
      divImages.style.left = `${mouse.X * this.state.startX}px`;
    }
    if (this.state.startY < 0) {
      divImages.style.top = `${this.state.startY * mouse.Y}px`;
    }
  }

  nextImages() {
    let { files } = this.state;
    if (this.state.indchapters.length > 0) {
      if (this.state.files[this.state.chapter] === undefined) return;
      ({ files } = this.state.files[this.state.chapter]);
      if (files === undefined) return;
    }
    if (files.length === 0) return;
    if (this.state.index + this.state.increment < files.length) {
      this.setIndex(this.state.index + this.state.increment);
    } else if (this.state.chapter + 1 < this.state.indchapters.length) {
      this.setIndex(0, this.state.chapter + 1);
    }
  }

  prevImages() {
    if (this.state.index > 0) {
      let { files } = this.state;
      if (this.state.indchapters.length > 0) {
        if (this.state.files[this.state.chapter] === undefined) return;
        ({ files } = this.state.files[this.state.chapter]);
        if (files === undefined) return;
      }
      if (files.length === 0) return;

      const fimg = files[this.state.index - 1];
      const rfimg = fimg.width / fimg.height;
      if ((rfimg < 1) && (this.state.index > 1)) {
        const simg = files[this.state.index - 2];
        const rsimg = simg.width / simg.height;
        if (rsimg < 1) {
          this.setIndex(this.state.index - 2);
          return;
        }
      }
      this.setIndex(this.state.index - 1);
    }
  }

  zoomplus() {
    const zoom = this.state.zoom + 0.1;
    if (zoom < 3) {
      this.setIndex(this.state.index, this.state.chapter, zoom);
    }
  }

  zoomdown() {
    const zoom = this.state.zoom - 0.1;
    if (zoom > 0) {
      this.setIndex(this.state.index, this.state.chapter, zoom);
    }
  }

  wheelhandler(e) {
    if (e.deltaY > 0) {
      this.zoomplus();
    } else {
      this.zoomdown();
    }
  }

  fullscreen() {
    const mainWindow = remote.getCurrentWindow();
    // document.getElementById('root').webkitRequestFullscreen();
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
    this.setIndex(this.state.index); // refresh sizes
  }

  keydownhandler(e) {
    switch (e.keyCode) {
      case 37:
        this.nextImages();
        break;
      case 39:
        this.prevImages();
        break;

      default:
        break;
    }
  }

  handlerChangeIndex(index, chapter) {
    this.setIndex(index, chapter);
  }

  render() {
    const divstyles = {
      left: `${this.state.startX}px`,
      top: `${this.state.startY}px`
    };
    return (
      <div>
        <div onMouseMove={this.moveImages.bind(this)} onWheel={this.wheelhandler.bind(this)} onClick={this.nextImages.bind(this)} onKeyDown={this.keydownhandler.bind(this)} className={styles.reader} id="reader" role="presentation">
          <NavBar
            onleft={this.prevImages.bind(this)}
            onright={this.nextImages.bind(this)}
            onexpand={this.fullscreen.bind(this)}
            onplus={this.zoomplus.bind(this)}
            onminus={this.zoomdown.bind(this)}
            onopen={this.handleOpenDir.bind(this)}
            onopenf={this.handleImportDir.bind(this)}
          />
          <ChapterNav
            onchange={this.handlerChangeIndex.bind(this)}
            images={this.state.files}
            chapters={this.state.indchapters}
            selectedIndex={this.state.index}
            selectedChapter={this.state.chapter}
          />
        </div>
        <div className={styles.container} style={divstyles} data-tid="container">
          {this.getImages()}
        </div>
      </div>
    );
  }
}
