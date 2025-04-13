import path from 'node:path';
import fs from 'fs';
const __dirname = import.meta.dirname;

const pathToCsvFile = path.join(__dirname, 'csv', 'detailed_sales_report.csv');
const pathToJsonFile = path.join(__dirname, 'json', 'data.json');

const readStream = fs.createReadStream(pathToCsvFile);
const writeStream = fs.createWriteStream(pathToJsonFile);

function main() {
  let mainObj = { data: [] };
  readStream.on('data', data => {
    const res = data.toString();

    const arrKeys = res
      .match(/^[^""]+$/gm)
      .join('')
      .split(',');

    const arrValues = res.match(/".+"/gm).join().split(/","/gm);

    let count = 0;
    let subObj = {};

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

    writeStream.write(JSON.stringify(mainObj, null, 2));
  });
}
main();
