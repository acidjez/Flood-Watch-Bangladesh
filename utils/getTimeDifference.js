export function getTimeDifference(timestamp) {
  // Convert Firestore timestamp to a JavaScript Date object
  const savedDate = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds

  // Get the current date
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const differenceInMilliseconds = currentDate.getTime() - savedDate.getTime();

  // Convert the difference to hours
  const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);

  // Return the difference rounded down to the nearest whole number
  return Math.floor(differenceInHours);
}
