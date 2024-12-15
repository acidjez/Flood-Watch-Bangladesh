async function getFromEndpoint(url) {
  const response = await fetch(`http://ffwc-api.bdservers.site/data_load/${url}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return await response.json();
}

async function getStations() {
  return await getFromEndpoint('observed/');
}

async function getRecentObserved() {
  return await getFromEndpoint('recent-observed/');
}

async function getThreeDaysObserved() {
  return await getFromEndpoint('three-days-observed/');
}

async function getThreeDaysObservedRainfall() {
  return await getFromEndpoint('three-days-observed-rainfall/');
}

module.exports = {
  getStations,
  getRecentObserved,
  getThreeDaysObserved,
  getThreeDaysObservedRainfall,
}