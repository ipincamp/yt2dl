/**
 * @name yt2dl
 * @version 1.0.9
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

/**
 *
 * @param {number} seconds
 * @returns {string}
 */
function toTime(seconds) {
  const weeks = Math.floor(seconds / (3600 * 24 * 7));
  const days = Math.floor((seconds % (3600 * 24 * 7)) / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = seconds % 60;
  let timeString = '';

  if (weeks > 0) {
    timeString += `${weeks}w `;
  }

  if (days > 0 || weeks > 0) {
    timeString += `${days}d `;
  }

  if (hours > 0 || days > 0 || weeks > 0) {
    timeString += `${hours < 10 ? `0${hours}` : hours}:`;
  }

  timeString += `${minutes < 10 ? `0${minutes}` : minutes}:${
    secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft
  }`;

  return timeString;
}

/**
 *
 * @param {string|number|Date} value
 * @returns {string}
 */
function toDate(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = date.getMonth();
  const day = date.getDate();

  return `${day < 10 ? `0${day}` : day} ${monthNames[month]} ${year}`;
}

module.exports = { toTime, toDate };
