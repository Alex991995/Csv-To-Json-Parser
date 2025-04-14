import path from 'node:path';
import { pipeline, Transform } from 'node:stream';
import fs from 'node:fs';
const __dirname = import.meta.dirname;

const pathToCsvFile = path.join(__dirname, 'csv', 'detailed_sales_report.csv');
const pathToJsonFile = path.join(__dirname, 'json', 'data.json');


const readStream = fs.createReadStream(pathToCsvFile);
const writeStream = fs.createWriteStream(pathToJsonFile);


const transformStream = new Transform({
  readableObjectMode: false,
  writableObjectMode: false,

  transform(chunk, encoding, callback) {
    const res = chunk.toString();

    const arrKeys = res
      .match(/^[^""]+$/gm)
      .join('')
      .split(',');

    const arrValues = res.match(/".+"/gm).join().split(/","/gm);

    let count = 0;
    let subObj = {};
    const mainObj = { data: [] };

    for (let i = 0; i < arrValues.length; i++) {
      if (count < arrKeys.length) {
        const key = arrKeys[count];
        const value = arrValues[i];
        count++;
        subObj[key] = value;
      } else {
        mainObj.data.push(subObj);
        count = 0;
        subObj = {};
        const key = arrKeys[count];
        const value = arrValues[i];
        subObj[key] = value;
        count++;
      }
    }
    mainObj.data.push(subObj);

    this.push(JSON.stringify(mainObj, null, 2));
    callback();
  }
});

pipeline(readStream, transformStream, writeStream, err => {
  console.log(err)
})









