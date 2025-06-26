const csv = require('csv-parser');
const fs = require('fs');
const Job = require('../models/Job');

// Import jobs from CSV file into MongoDB
async function importJobsFromCSV(filePath) {
  return new Promise((resolve, reject) => {
    const jobs = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        jobs.push({
          title: row.title,
          description: row.description,
          skills: row.skills ? row.skills.split(';') : [],
          status: row.status,
          averageSalary: row.averageSalary,
          companies: row.companies ? row.companies.split(';') : [],
        });
      })
      .on('end', async () => {
        try {
          await Job.insertMany(jobs);
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

module.exports = { importJobsFromCSV };
