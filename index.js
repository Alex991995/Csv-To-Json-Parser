import path from 'node:path';
import { pipeline, Transform } from 'node:stream';
import fs from 'node:fs';
const __dirname = import.meta.dirname;

const pathToCsvFile = path.join(__dirname, 'csv', 'detailed_sales_report.csv');
const pathToJsonFile = path.join(__dirname, 'json', 'data.json');
const readStream = fs.createReadStream(pathToCsvFile);
const writeStream = fs.createWriteStream(pathToJsonFile);

class MyTransform extends Transform {
  #headers = [];
  #buffer = '';

  _transform(chunk, encoding, callback) {
    let rawString = chunk.toString();

    if (this.buffer) {
      rawString = this.buffer + rawString;
    }
    let arr = rawString.split(/\n/);

    let mainArray = [];
    if (arr.length === 0) {
      callback();
    } else {
      if (!this.#headers.length) {
        this.#headers = arr[0].split(',');
      }

      for (let i = 1; i < arr.length; i++) {
        const obj = {};

        const subArr = arr[i].split(/"([^"]+)"/gm).filter(item => {
          if (item !== ',' && item !== '' && item !== undefined) {
            console.log(item);
            return true;
          } else return false;
        });

        if (subArr.length) {
          for (let j = 0; j < subArr.length; j++) {
            obj[this.#headers[j]] = subArr[j];
          }
        }
        mainArray.push(obj);
      }

      this.push(JSON.stringify(mainArray, null, 2));
      callback();
    }
  }
}

const transformStream = new MyTransform();

pipeline(readStream, transformStream, writeStream, err => {
  console.log(err);
});
