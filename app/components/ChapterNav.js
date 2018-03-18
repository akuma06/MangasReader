// @flow
import React, { Component } from 'react';
import styles from './ChapterNav.css';
import ImageNav from './ImageNav';

type Props = {
  onchange: (index, chapter) => void,
  images: Array,
  chapters: Array,
  selectedIndex: number,
  selectedChapter: number
};

function stopProp(e) {
  e.stopPropagation();
}

export default class Reader extends Component<Props> {
  props: Props;

  state = {
    shown: false,
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.selectedIndex !== this.props.selectedIndex
      || prevProps.selectedChapter !== this.props.selectedChapter) {
      const selectedImg = document.getElementById(`navitem_${this.props.selectedChapter}_${this.props.selectedIndex}`);
      if (selectedImg !== undefined) selectedImg.scrollIntoViewIfNeeded({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }
  generateItems() {
    const l = this.props.chapters.length;
    const items = [];
    if (l > 0) {
      for (let c = 0; c < l; c += 1) {
        const key = `cht_${c}`;
        items.push(<h3 key={key}>Chapter {c + 1}</h3>);
        const imgchap = this.generateChapter(c);
        items.push(...imgchap);
      }
    } else {
      const imgchap = this.generateChapter(0);
      items.push(...imgchap);
    }
    return items;
  }
  generateChapter(c) {
    const items = [];
    let { images } = this.props;
    if (this.props.chapters.length > 0) {
      if (images[c] === undefined) return;
      images = images[c].files;
    }
    const l = images.length;
    for (let i = 0; i < l; i += 1) {
      const img = images[i];
      const key = `navitem_${c}_${i}`;
      const selected = ((this.props.selectedIndex === i) && (this.props.selectedChapter === c));
      items.push(<ImageNav
        image={img}
        key={key}
        selected={selected}
        page={i}
        chapter={c}
        id={key}
        onclick={this.props.onchange}
      />);
    }
    return items;
  }
  toggleNav(e) {
    this.setState({ shown: !this.state.shown });
    e.stopPropagation();
  }

  render() {
    const arrow = (this.state.shown) ? 'fa fa-arrow-left' : 'fa fa-arrow-right';
    const classname = (!this.state.shown) ? `${styles.navimg} ${styles.hide}` : styles.navimg;

    return (
      <div className={styles.navimgcontainer} onWheel={stopProp} onMouseMove={stopProp}>
        <div className={classname}>
          {this.generateItems()}
        </div>
        <button className={styles.navbutton} onClick={this.toggleNav.bind(this)}>
          <i className={arrow} />
        </button>
      </div>
    );
  }
}
