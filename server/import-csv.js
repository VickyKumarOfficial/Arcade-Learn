// This script can be run once to import your CSV data into MongoDB
require('dotenv').config();
const connectDB = require('./config/db');
const { importJobsFromCSV } = require('./utils/csvImporter');

const csvPath = './data/skills_jobs.csv'; // Place your CSV file here

(async () => {
  await connectDB();
  await importJobsFromCSV(csvPath);
  console.log('CSV import complete');
  process.exit();
})();
