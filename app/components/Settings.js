// @flow
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
import React, { Component } from 'react';
import styles from './Settings.css';
import { settings, settingsParam, Param } from '../settings';

type Props = {
  history: object
};

type State = {
  settings: object
};

const gui: {
  [key: string]: (name: string, setting: Param, fn: (e) => void) => void
} = {
  input: (name, setting, fn) => (
    <label htmlFor={name}>
      {settingsParam[name].label}
      <input
        type={setting.type}
        value={settings.get(name)}
        data-name={name}
        name={name}
        id={name}
        onChange={fn}
        {...setting.params}
      />
    </label>
  )
};

export default class Settings extends Component<Props, State> {
  props: Props;

  state = { settings }

  onChange(e) {
    const el: HTMLElement = e.target;
    if (this.state.settings.get(el.dataset.name) !== el.value) {
      settings.set(el.dataset.name, el.value);
      this.setState({ settings });
    }
  }

  generateGui(name: any) {
    if (settingsParam[name] === undefined) return;
    if (gui[settingsParam[name].interface] === undefined) {
      console.error("Interface '%s' doesn't exist for '%s'", settingsParam[name].interface, name);
      return;
    }
    return gui[settingsParam[name].interface](name, settingsParam[name], this.onChange.bind(this));
  }

  render() {
    return (
      <div className={styles.container}>
        <h1>
          <button onClick={this.props.history.goBack}>
            <i className="fa fa-arrow-left" />
          </button>
          Settings
        </h1>
        <form>
          <h2>General</h2>
          <div>
            {this.generateGui('zoom')}
          </div>
        </form>
      </div>
    );
  }
}

