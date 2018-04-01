// @flow
import { isObject } from 'util';

const settings = require('electron-settings');

export type Settings = {
  zoom: number,
  version: number
};

const DEFAULTS: Settings = {
  zoom: 1,
  version: 2
};

export type Param = {
  interface: string,
  label: string,
  type: string,
  params: { [x: string]: any }
};

const settingsParam: {
  [key: string]: Param
} = {
  zoom: {
    interface: 'input',
    label: 'Zoom',
    type: 'number',
    params: {
      min: '0',
      max: '10',
      step: '0.1'
    }
  }
};

function initializeSettings() {
  if (settings.getAll().length === 0) {
    settings.setAll(DEFAULTS);
  } else if (settings.get('version', 0) < DEFAULTS.version) {
    const updateSettings = update(DEFAULTS, settings.getAll());
    updateSettings.version = DEFAULTS.version;
    settings.setAll(updateSettings);
  }
}

function update(from: object, to = {}) {
  const returnObj = to;
  Object.keys(from).forEach((value: string) => {
    if (isObject(from[value])) returnObj[value] = update(from[value]);
    else if (returnObj[value] === undefined) returnObj[value] = from[value];
  });
  return returnObj;
}

export { settings, initializeSettings, DEFAULTS, settingsParam };
