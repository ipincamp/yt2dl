/**
 * @name yt2dl
 * @version 1.0.9
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

const { getInfo, validateURL } = require('ytdl-core');
const { toTime, toDate } = require('../utils/dateTime');
const apiValidation = require('../utils/apiValidation');
const encrypt = require('../utils/encrypt');
const resJson = require('../utils/resJson');

/**
 *
 * @param {import('ytdl-core').videoFormat} format
 */
function filterFormat(format) {
  return format.mimeType?.includes('audio/mp4') || (format.hasAudio && format.hasVideo);
}

/**
 *
 * @param {import('ytdl-core').videoFormat} format
 * @param {string} title
 */
function mapFormat(format, title) {
  const { height, audioBitrate, url } = format;
  const quality = height !== undefined ? `${height}p (mp4)` : `${audioBitrate}k (mp3)`;
  const token = JSON.stringify({
    v: 1,
    t: `${title} [${quality.slice(0, -6)}] ${url}`,
  });

  return { q: quality, t: encrypt(token) };
}

/**
 *
 * @param {string} url
 */
async function fetchYtdlCore(url) {
  const { formats, videoDetails } = await getInfo(url);
  const {
    lengthSeconds, ownerChannelName, publishDate, thumbnails, title,
  } = videoDetails;
  const thumbnail = thumbnails.pop()?.url;
  const result = {
    title,
    thumbnail,
    channel: ownerChannelName,
    duration: toTime(+lengthSeconds),
    published: toDate(publishDate),
    formats: formats
      .filter(filterFormat)
      .map((format) => mapFormat(format, title))
      .sort((a, b) => parseInt(a.q, 10) - parseInt(b.q, 10)),
  };

  return result;
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
module.exports = async (req, res) => {
  try {
    const { error, value } = apiValidation(req.body);
    if (error) {
      resJson(res, 400, error.details[0].message.replace(/"/g, "'"));
      return;
    }

    if (!validateURL(value.url)) {
      resJson(res, 422, 'invalid url');
      return;
    }

    const data = await fetchYtdlCore(value.url);

    resJson(res, 200, 'success', data);
  } catch (error) {
    resJson(res, 500, error?.message ?? 'unknown errors');
  }
};
