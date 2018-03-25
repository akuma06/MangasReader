import { isObject } from 'util';

// @flow
const settings = require('electron-settings');

type Settings = {
  zoom: number,
  version: number
};

const DEFAULTS: Settings = {
  zoom: 1,
  version: 2
};

function initializeSettings() {
  if (settings.getAll().length == 0) {
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

export { settings, initializeSettings };
