const fs = require('fs');
const path = require('path');

const enFile = 'C:\\Users\\Melih\\Documents\\Projects\\akilhane\\messages\\en.json';
const trFile = 'C:\\Users\\Melih\\Documents\\Projects\\akilhane\\messages\\tr.json';

const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const trData = JSON.parse(fs.readFileSync(trFile, 'utf8'));

if (enData.Dashboard && enData.Dashboard.quickTestDesc) {
  enData.Dashboard.quickTestDesc = "question quick test";
}

if (trData.Dashboard && trData.Dashboard.quickTestDesc) {
  trData.Dashboard.quickTestDesc = "soruluk hızlı test çöz";
}

fs.writeFileSync(enFile, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(trFile, JSON.stringify(trData, null, 2), 'utf8');
console.log('JSON updated for quickTestDesc');
