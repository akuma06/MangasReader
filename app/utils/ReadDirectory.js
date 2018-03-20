// @flow
import { remote } from 'electron';

type File = {
  type: 'dir' | 'img',
  filename: string,
  files: Files | void,
  src: string | void,
  width: number | void,
  height: number | void
};

type Files = Array<File>;

function isImage(filename: string) {
  return filename.match(/(?:bmp|png|gif|jpg|jpeg)$/i);
}

function uniformize(filename: string) {
  return filename.replace(/[._\- ]*/g, '');
}

function walk(dir: string, done: (err, results?: Files) => void) {
  const fs = remote.require('fs');
  const path = remote.require('path');
  const sizeOf = remote.require('image-size');
  const results: Files = [];
  fs.readdir(dir, (err, list?: Array) => {
    if (err) return done(err);
    let pending = list.length;
    const images: Array<string | File> = [];
    const index: Files = [];
    if (!pending) return done(null, results);
    list.forEach((file: string, i: number) => {
      const filepath: string = path.resolve(dir, file);
      fs.stat(filepath, (err2, stat) => {
        if (stat && stat.isDirectory()) {
          walk(filepath, (err3, res: Files) => {
            results[i] = {
              type: 'dir',
              filename: file,
              files: res
            };
            pending -= 1;
            if (!pending) done(null, results);
          });
        } else {
          if (isImage(file)) {
            const filename = uniformize(file);
            const dimensions = sizeOf(filepath);
            images.push(filename);
            index[filename] = {
              type: 'img',
              filename: file,
              src: filepath,
              width: dimensions.width,
              height: dimensions.height
            };
          }
          pending -= 1;
          if (!pending) {
            if (images.length > 0) {
              images.sort();
              images.forEach((val, ind) => { images[ind] = index[val]; });
              results.push(...images);
            }
            done(null, results);
          }
        }
      });
    });
  });
}

function haveImages(folder: File) {
  if (folder.type === 'dir') {
    const l = folder.files.length;
    if (l === 0) return false;
    if (folder.files[0].type === 'img') return true;
    for (let i = 0; i < l; i += 1) {
      if (folder.files[i].type === 'img') return true;
    }
    return false;
  }
  return true;
}

function filterFolder(files: Files) {
  const l = files.length;
  for (let i = 0; i < l; i += 1) {
    if (files[i].type === 'img') return files;
    if (haveImages(files[i])) return files;
    else if (files[i].type === 'dir') {
      const newFolder = filterFolder(files[i].files);
      if (newFolder.length > 0) return files[i].files;
    }
  }
  return [];
}

function ReadDirectory(folderPath: string, callback: (res: Files) => void) {
  walk(folderPath, (err, res) => callback(filterFolder(res)));
}

export { ReadDirectory, File, Files };
