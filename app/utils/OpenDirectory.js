import { remote } from 'electron';
import decompress from 'decompress';
import unrar from 'node-unrar-js';

import path from 'path';

function isArchive(fileName: string) {
  return fileName.match(/[zip|rar]$/i);
}

function isRar(fileName: string) {
  return fileName.match(/rar$/i);
}


function extractOther(filepath: string, fileName: string, callback: (folderPath: string) => void) {
  const folderPath = path.resolve(remote.app.getPath('documents'), remote.app.getName(), fileName);
  decompress(filepath, folderPath)
    .then(() => callback(folderPath))
    .catch((err) => console.log(err));
  return folderPath;
}

function unRar(filepath: string, fileName: string, callback: (folderPath: string) => void) {
  const folderPath = path.resolve(remote.app.getPath('documents'), remote.app.getName(), fileName);
  const archive = unrar.createExtractorFromData(filepath, folderPath);
  const extracted = archive.extractAll();
  if (extracted[0].state === 'SUCCESS') {
    callback(folderPath);
  } else {
    console.error('File cannot be extracted');
  }
}

function OpenDirectory(callback: (folderPath: string) => void) {
  const { dialog } = remote;

  dialog.showOpenDialog((fileNames) => {
    if (fileNames === undefined) return;
    const fileName = fileNames[0];

    if (isArchive(fileName)) {
      if (isRar(fileName)) {
        unRar(fileName, fileName.replace(/^.*[\\/]/, ''), callback);
      } else {
        extractOther(fileName, fileName.replace(/^.*[\\/]/, ''), callback);
      }
    } else {
      const folderPath = path.dirname(fileName);
      callback(folderPath);
    }
  });
}

function ImportDirectory(callback: (folderPath: string) => void) {
  const { dialog } = remote;

  dialog.showOpenDialog(
    {
      properties: ['openDirectory']
    },
    (fileNames) => {
      if (fileNames === undefined) return;
      const fileName = fileNames[0];
      callback(fileName);
    }
  );
}

export default { OpenDirectory, ImportDirectory };
