import { remote } from 'electron';

function isImage(filename: string) {
  return filename.match(/(?:bmp|png|gif|jpg|jpeg)$/i);
}

function uniformize(filename: string) {
  return filename.replace(/[._\- ]*/g, '');
}

function walk(dir: string, done: (err, results: Array) => void) {
  const fs = remote.require('fs');
  const path = remote.require('path');
  const sizeOf = remote.require('image-size');
  const results = [];
  fs.readdir(dir, (err, list: Array) => {
    if (err) return done(err);
    let pending = list.length;
    const images = [];
    const index = [];
    if (!pending) return done(null, results);
    list.forEach((file: string, i: number) => {
      const filepath = path.resolve(dir, file);
      fs.stat(filepath, (err2, stat) => {
        if (stat && stat.isDirectory()) {
          walk(filepath, (err3, res) => {
            results[i] = {
              type: 'dir',
              name: file,
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

export default function ReadDirectory(folderPath: string, callback) {
  walk(folderPath, (err, res) => callback(res));
}
