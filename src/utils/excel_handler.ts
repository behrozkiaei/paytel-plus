const _ = require('lodash');
const moment = require('moment-jalaali');
const XLSX = require('xlsx');
const fs = require('fs');
module.exports.jsonTransform = function (data, columns) {
  const final = [];
  for (const row of data) {
    const obj = {};
    for (const columnKey in columns) {
      const key = _.get(columns, columnKey);
      console.log(_.get(row, columnKey));
      obj[key] = _.get(row, columnKey);
    }
    final.push(obj);
  }
  return final;
};

module.exports.exportXLSX = function (sheet_name, documents, columns) {
  try {
    if (!fs.existsSync(`public`)) {
      fs.mkdirSync(`public`);
    }
    if (!fs.existsSync(`public/exports`)) {
      fs.mkdirSync(`public/exports`);
    }
    // let docs = this.jsonTransform(documents, columns);
    const date = moment().format('jYYYY-jMM-jDD-HH-mm-ss');
    const file_name = `${sheet_name}-${date}.xlsx`;
    // let preparedDoc
    // if(sheet_name == "transactions"){
    //       preparedDoc = this.jsonTransformTransactions(documents)
    // }else{
    //     preparedDoc = documents
    // }
    const ws = XLSX.utils.json_to_sheet(documents);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, sheet_name);
    XLSX.writeFile(wb, `public/exports/${file_name}`);

    return file_name;
  } catch (error) {
    console.log('error in exportXLSX ', error.message);
    return error;
  }
};
module.exports.jsonTransformTransactions = function (data) {
  const final = [];
  for (const row of data) {
    final.push({
      ...row,
      walletAmount: row.wallet.amount,
      name: row.wallet.user.name,
      mobile: row.wallet.user.mobile,
    });
  }
  return final;
};
