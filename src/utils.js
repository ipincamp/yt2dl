const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const myHead = {
  ct: 'application/x-www-form-urlencoded; charset=UTF-8',
  ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0'
};

/**
 *
 * @param {number} code
 * @param {string} message
 * @param {import('express').Response} res
 * @param {any} data
 * @returns
 */
function resJson(code, message, res, data) {
  return res.status(code).json({
    status: code < 400,
    statusCode: code,
    message,
    data: data ?? []
  });
}

/**
 *
 * @param {number} seconds
 * @returns {string}
 */
function toTime(seconds) {
  const weeks = Math.floor(seconds / (3600 * 24 * 7));
  const days = Math.floor((seconds % (3600 * 24 * 7)) / (3600 * 24));
  let hours = Math.floor((seconds % (3600 * 24)) / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let secondsLeft = seconds % 60;

  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  secondsLeft = secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft;

  let timeString = '';

  if (weeks > 0) {
    timeString += `${weeks}w `;
  }

  if (days > 0 || weeks > 0) {
    timeString += `${days}d `;
  }

  if (hours > 0 || days > 0 || weeks > 0) {
    timeString += `${hours}:`;
  }

  timeString += `${minutes}:${secondsLeft}`;

  return timeString;
}

/**
 *
 * @param {string | number | Date} value
 * @returns {string}
 */
function toDate(value) {
  const date = new Date(value);
  let day = date.getDate();
  let month = date.getMonth();
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
    'December'
  ];

  day = day < 10 ? `0${day}` : day;
  month = monthNames[month];

  return `${day} ${month} ${year}`;
}

/**
 *
 * @param {string} str
 * @returns {string}
 */
function encrypt(str) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let raw = cipher.update(str);

  raw = Buffer.concat([raw, cipher.final()]);

  return `${iv.toString('hex')}.${raw.toString('hex')}.${key.toString('hex')}`;
}

/**
 *
 * @param {string} str
 * @returns { { valid: boolean, result: string } }
 */
function decrypt(str) {
  if (str.match(/\./g)?.length !== 2) {
    return {
      valid: false,
      result: 'invalid token (format).'
    };
  }

  const enc = str.split('.');

  if (enc[0].length !== 32) {
    return {
      valid: false,
      result: 'invalid token (iv).'
    };
  }

  if (enc[2].length !== 64) {
    return {
      valid: false,
      result: 'invalid token (key).'
    };
  }

  const iv = Buffer.from(enc[0], 'hex');
  const raw = Buffer.from(enc[1], 'hex');
  const key = Buffer.from(enc[2], 'hex');

  try {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(raw);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return {
      valid: true,
      result: decrypted.toString()
    };
  } catch {
    return {
      valid: false,
      result: 'invalid token (process)'
    };
  }
}

module.exports = {
  myHead,
  resJson,
  toDate,
  toTime,
  encrypt,
  decrypt
};
