// @flow
import React, { Component } from 'react';
import styles from './ImageNav.css';

type Props = {
  onclick: (index) => void,
  image: object,
  selected: boolean,
  page: number,
  chapter: number,
  id: string
};

export default class Reader extends Component<Props> {
  props: Props;

  onclick(e) {
    e.preventDefault();
    this.props.onclick(this.props.page, this.props.chapter);
    e.stopPropagation();
  }

  render() {
    const classname = (this.props.selected) ? `${styles.item} ${styles.selected}` : styles.item;
    return (
      <a href="#" id={this.props.id} className={classname} onClick={this.onclick.bind(this)} role="button">
        <img src={this.props.image.src} alt={this.props.image.filename} />
        <p>Page {this.props.page + 1}</p>
      </a>
    );
  }
}
