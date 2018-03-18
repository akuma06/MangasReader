// @flow
import React, { Component } from 'react';
import { remote } from 'electron';
import styles from './Reader.css';
import { history } from '../store/configureStore';
import ReadDirectory from '../utils/ReadDirectory';
import NavBar from './NavBar';
import ChapterNav from './ChapterNav';
import { OpenDirectory, ImportDirectory } from '../utils/OpenDirectory';
import { AddBook, UpdateRead, GetReadingState } from '../utils/Database';

type Props = {};

function handleOpenDir() {
  OpenDirectory((folderPath) => callbackAfterOpen(folderPath));
}

function handleImportDir() {
  ImportDirectory((folderPath) => callbackAfterOpen(folderPath));
}

function callbackAfterOpen(folderPath: string) {
  AddBook(folderPath);
  GetReadingState(folderPath, (readState) => {
    let chapter = 0;
    let index = 0;
    if (readState !== undefined) {
      ({ index, chapter } = readState);
    }
    history.push('/reader', { folderPath, chapter, index });
  });
}

export default class Reader extends Component<Props> {
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
    zoom: 1
  };


  componentDidMount() {
    this.handleReadDirectory();
    document.body.addEventListener('keydown', this.keydownhandler.bind(this));
  }

  componentDidUpdate(prevProps, prevState) {
    if ((prevState.index !== this.state.index
      || prevState.chapter !== this.state.chapter)
      && (this.state.chapter > 0
      || (this.state.index > 0 && this.state.chapter === 0))) {
      UpdateRead(history.location.state.folderPath, this.state.chapter, this.state.index);
    }
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.keydownhandler.bind(this));
  }

  handleReadDirectory() {
    ReadDirectory(history.location.state.folderPath, (files: Array) => {
      let notchapters = false;
      const indchapters = [];
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
      const index = (history.location.state.index) ? history.location.state.index : 0;
      const chapter = (history.location.state.chapter) ? history.location.state.chapter : 0;
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
        console.log('End of chapter');
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
            onopen={handleOpenDir}
            onopenf={handleImportDir}
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
