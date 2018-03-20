// @flow
import { remote } from 'electron';

type File = {
  type: 'dir' | 'img',
  filename: string,
  files: Array<File> | void,
  src: string | void,
  width: number | void,
  height: number | void
};

function isImage(filename: string) {
  return filename.match(/(?:bmp|png|gif|jpg|jpeg)$/i);
}

function uniformize(filename: string) {
  return filename.replace(/[._\- ]*/g, '');
}

function walk(dir: string, done: (err, results?: Array<File>) => void) {
  const fs = remote.require('fs');
  const path = remote.require('path');
  const sizeOf = remote.require('image-size');
  const results: Array<File> = [];
  fs.readdir(dir, (err, list?: Array) => {
    if (err) return done(err);
    let pending = list.length;
    const images: Array<string | File> = [];
    const index: Array<File> = [];
    if (!pending) return done(null, results);
    list.forEach((file: string, i: number) => {
      const filepath: string = path.resolve(dir, file);
      fs.stat(filepath, (err2, stat) => {
        if (stat && stat.isDirectory()) {
          walk(filepath, (err3, res: Array<File>) => {
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

function ReadDirectory(folderPath: string, callback: (res: Array<File>) => void) {
  walk(folderPath, (err, res) => callback(res));
}

export default { ReadDirectory, File };
