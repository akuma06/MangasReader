// @flow
import PouchDB from 'pouchdb';

PouchDB.plugin(require('pouchdb-find'));

let db = new PouchDB('library');

export type Book = {
  _id: string,
  title: string,
  name: string | void, // since some values can be undefined due to old db
  folderPath: string,
  volume: string,
  chapters: string,
  reading: {
    chapter: number,
    index: number
  } | void,
  date: number
};

function uniformize(filename: string) {
  return filename.replace(/[._ ]*/g, '');
}

function GetBooks(callback) {
  db.createIndex({
    index: {
      fields: ['date']
    }
  }).then(() => db.find({
    selector: {
      date: { $gte: null }
    },
    sort: [{ date: 'desc' }],
    limit: 10
  })
    .then((result) => callback(result.docs))
    .catch((err) => console.log(err)))
    .catch((err) => console.log(err));
}

function AddBook(folderPath, done: (book: Book) => void) {
  const title = folderPath.replace(/^.*[\\/]/, '');
  const uniTitle = uniformize(title);
  const name = title.replace(/(.+)(?:(?:v|vol|volume)[ ]*[0-9_\- ]+)+(?:(?:c|ch|chapter)[ ]*[0-9_\- ]+)+.+/i, '$1').replace(/ $/, '');
  const volume = uniTitle.replace(/^.*(?:v|vol|volume){1}([0-9]+).*$/i, '$1');
  const chapters = uniTitle.replace(/^.*(?:c|ch|chapter){1}([0-9-]+).*$/gi, '$1');
  db.get(uniTitle)
    .then((doc: Book) => {
      if (doc === undefined) return;
      const document = Object.assign(doc, {
        name, folderPath, volume, chapters, date: new Date().getTime()
      });
      return db.put(document).then(() => done(document)).catch(console.log);
    })
    .catch((e) => {
      if (e.status === 404) {
        const document: Book = {
          _id: uniTitle,
          title,
          name,
          folderPath,
          volume,
          chapters,
          reading: {
            chapter: 0,
            index: 0
          },
          date: new Date().getTime()
        };
        return db.put(document).then(() => done(document)).catch(console.log);
      }
    });
}

function UpdateRead(folderPath: string, chapter: number, index: number) {
  const title = folderPath.replace(/^.*[\\/]/, '');
  const uniTitle = uniformize(title);
  db.get(uniTitle)
    .then((doc: Book) => {
      const document: Book = doc;
      if (document === undefined) return;
      document.reading = { chapter, index };
      document.date = new Date().getTime();
      return db.put(document);
    })
    .catch((e) => console.log(e));
}

function GetBook(folderPath: string, done: (book) => void) {
  const title = folderPath.replace(/^.*[\\/]/, '');
  const uniTitle = uniformize(title);
  db.get(uniTitle)
    .then((doc) => done(doc))
    .catch((e) => {
      if (e.status === 404) {
        return done({ reading: { chapter: 0, index: 0 } });
      }
      console.log(e);
    });
}

function EraseBooks(done: () => void) {
  db.destroy()
    .then(() => {
      db = new PouchDB('library');
      return done();
    })
    .catch(console.log);
}

export { GetBooks, AddBook, UpdateRead, GetBook, EraseBooks };
