// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { logger } = require('firebase-functions');
const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');

// Initialize the Firebase Admin SDK
const { initializeApp } = require('firebase-admin/app');
initializeApp();

// Get database functions
const { updateDatabase } = require('./database');

// Fetch data from API and write to Firestore
exports.fetchDataFromAPI = onRequest({
  cors: false,
  region: 'asia-southeast1',
}, async (request, response) => {
  try {
    await updateDatabase();
    logger.info('Data successfully written to Firestore');
    response.status(200).send('Data successfully written to Firestore');
  } catch (error) {
    logger.error('Error fetching or writing data', error);
    response.status(500).send(error.message);
  }
});

// Schedule function to fetch data from API
exports.scheduledFetchDataFromAPI = onSchedule({
  region: 'asia-southeast1',
  schedule: 'every 24 hours',
}, async (context) => {
  try {
    await updateDatabase();
    logger.info('Data successfully written to Firestore');
  } catch (error) {
    logger.error('Scheduled function error', error.message);
  }
});