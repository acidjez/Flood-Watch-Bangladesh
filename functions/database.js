// The Firebase Admin SDK to access Firestore.
const { logger } = require('firebase-functions');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

// Get API endpoints
const {
  getStations,
  getRecentObserved,
  getThreeDaysObserved,
  getThreeDaysObservedRainfall,
} = require('./endpoints');

// Update Firestore with data from API
async function updateDatabase() {
  const db = getFirestore();
  await updateStations(db);
  await updateSummaries(db);
  db.collection('details').doc('database').set({ last_updated: FieldValue.serverTimestamp() }, { merge: true });
}

// Update stations in Firestore
async function updateStations(db) {
  const batch = db.batch();
  const stations = await getStations();
  const recentObserved = await getRecentObserved();
  const threeDaysObserved = await getThreeDaysObserved();
  const threeDaysObservedRainfall = await getThreeDaysObservedRainfall();

  await Promise.all(stations.map(async (station) => {
    let stationId = String(station.st_id);

    // Set warning level and send notification if waterlevel exceeds it
    station.warninglevel = station.dangerlevel - 0.5;
    if (station.waterlevel > station.warninglevel) checkNotifications(db, stationId, station.waterlevel > station.dangerlevel);

    // Get waterlevel
    station.waterlevelRef = db.collection('waterlevels').doc(stationId);
    let waterlevelDoc = await station.waterlevelRef.get();
    if (!waterlevelDoc.exists) await station.waterlevelRef.set({ values: [] });
    await updateWaterlevel(batch, station, recentObserved[stationId]);

    // Get rainfall reference
    station.rainfallRef = db.collection('rainfall').doc(stationId);
    let rainfallDoc = await station.rainfallRef.get();
    if (!rainfallDoc.exists) await station.rainfallRef.set({ values: [] });
    await updateRainfall(batch, station, threeDaysObservedRainfall[stationId]);

    // Remove unnecessary fields
    delete station.waterlevel;
    delete station.wl_date;

    batch.set(db.collection('stations').doc(stationId), station);
  }));

  await batch.commit();
}

// Send notification to user
async function sendNotification(fcmToken, title, message) {
  try {
    await getMessaging().send({
      notification: {
        title: title,
        body: message,
      },
      token: fcmToken,
    });
    logger.info(`Notification sent to token: ${fcmToken}`);
  } catch (error) {
    logger.error(`Error sending notification to token ${fcmToken}:`, error);
  }
}

// Check if notifications need to be sent
async function checkNotifications(db, stationId, isEmergency) {
  const userWatchlistSnapshot = await db.collection("user_watchlist").get();

  // Process notifications for users watching this station
  const notificationPromises = userWatchlistSnapshot.docs.map(async (userDoc) => {
    let data = userDoc.data();
    let fcmToken = data?.fcmToken;
    if (!fcmToken) {
      logger.info(`No FCM token for user ${userDoc.id}`);
      db.collection("user_watchlist").doc(userDoc.id).delete();
      return;
    }

    // Check if the user is watching this station
    let userGauge = data?.gauges?.find((gauge) => gauge.st_id == stationId);

    if (userGauge) {
      let name = userGauge.customName || userGauge.name; // Will custom name be a XSS risk? Who knows! Not me! :D
      let message = isEmergency && userGauge.emergencyWarning
        ? `${name} has exceeded the danger level` : userGauge.watchAndAct
        ? `${name} is nearing the danger level` : null;
    
      if (message) {
        let title = isEmergency ? "Danger" : "Warning";
        return sendNotification(fcmToken, title, message);
      }
    }
  });

  await Promise.all(notificationPromises);
}

// Update waterlevels in Firestore
async function updateWaterlevel(batch, station, waterlevels) {
  // waterlevels: [
  //   { '27-10-2024': '10.48' },
  //   { '28-10-2024': '10.36' },
  //   { '29-10-2024': '10.24' }
  // ]
  // recentObserved: [
  //   { '2024-10-29 12': '10.21' },
  //   { '2024-10-29 15': '10.19' }
  // ]
  if (!waterlevels) return;

  let stationWaterlevels = await Promise.all(waterlevels.map(async (waterlevel) => {
    let timestamp = Object.keys(waterlevel)[0];
    // Timestamps are in the format 'yyyy-mm-dd hh' for recentObserved and in the GMT+6 timezone
    timestamp = new Date(`${timestamp.split(' ').join('T')}:00:00+06:00`); // For recentObserved
    // timestamp = new Date(`${timestamp.split('-').reverse().join('-')}T00:00:00`); // For 3 day observed
    let value = Number(Object.values(waterlevel)[0]);
    return { value, timestamp };
  }));
  stationWaterlevels.sort((a, b) => a.timestamp - b.timestamp);

  batch.set(station.waterlevelRef, {
    values: FieldValue.arrayUnion(...stationWaterlevels)
  }, { merge: true });
}

// Update rainfall in Firestore
async function updateRainfall(batch, station, rainfall) {
  // [
  //   { '27-10-2024': '0.00' },
  //   { '28-10-2024': '0.00' },
  //   { '29-10-2024': '0.00' }
  // ]
  if (!rainfall) return;

  let stationRainfall = await Promise.all(rainfall.map(async (rainfallDay) => {
    let timestamp = Object.keys(rainfallDay)[0];
    // Timestamps are in the format 'dd-mm-yyyy' for 3 day observed and in the GMT+6 timezone
    timestamp = new Date(`${timestamp.split('-').reverse().join('-')}T00:00:00+06:00`);
    let value = Number(Object.values(rainfallDay)[0]);
    return { value, timestamp };
  }));
  stationRainfall.sort((a, b) => a.timestamp - b.timestamp);

  batch.set(station.rainfallRef, {
    values: FieldValue.arrayUnion(...stationRainfall)
  }, { merge: true });
}

// Get summaries for waterlevels and rainfall
async function updateSummaries(db) {
  // Get all stations
  const stations = await db.collection('stations').get();

  const batch = db.batch();
  await Promise.all(stations.docs.map(async (station) => {
    let stationId = station.id;

    let waterlevels = (await db.collection('waterlevels').doc(stationId).get()).data()?.values || [];
    let rainfall = (await db.collection('rainfall').doc(stationId).get()).data()?.values || [];

    waterlevels = getLastSevenDaysValues(waterlevels);
    rainfall = getLastSevenDaysValues(rainfall);

    batch.set(db.collection('stations').doc(stationId), {
      waterlevels,
      rainfall
    }, { merge: true });
  }));

  await batch.commit();
}

// Get last seven days values
function getLastSevenDaysValues(values) {
  const result = [];
  const mostRecent = values[values.length - 1]?.timestamp.toDate() || new Date();
  for (let i = 0; i < 7; i++) {
    const day = new Date(mostRecent);
    day.setDate(mostRecent.getDate() - i);
    const dayString = day.toISOString().split('T')[0];

    const dayValues = values.filter(item => item.timestamp.toDate().toISOString().startsWith(dayString));
    if (dayValues.length > 0) {
      const latestValue = dayValues.reduce((latest, current) => current.timestamp.toDate() > latest.timestamp.toDate() ? current : latest);
      result.push(latestValue);
    }
  }
  return result.reverse();
}

module.exports = {
  updateDatabase
};