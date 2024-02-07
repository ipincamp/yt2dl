/**
 * @name yt2dl
 * @version v1.0.8
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

const { validateURL, getInfo } = require('ytdl-core');
const { apiSchema } = require('../validation');
const {
  toTime, toDate, encrypt, resJson
} = require('../utils');

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function v1(req, res) {
  try {
    /** validation */
    const { error, value } = apiSchema.validate(req.body);

    if (error) {
      resJson(400, error.details[0].message.replace(/"/g, "'"), res);
      return;
    }

    if (!validateURL(value.url)) {
      resJson(400, 'invalid url');
      return;
    }

    /** fetch api */
    const { formats, videoDetails } = await getInfo(value.url);
    const {
      lengthSeconds, ownerChannelName, publishDate, thumbnails, title
    } = videoDetails;
    const thumbnail = thumbnails.pop().url;
    const result = {
      title,
      thumbnail,
      channel: ownerChannelName,
      duration: toTime(+lengthSeconds),
      published: toDate(publishDate),
      formats: formats
        .filter((f) => f.mimeType.includes('audio/mp4') || (f.hasAudio && f.hasVideo))
        .map((f) => ({
          q: f.height ? `${f.height}p (mp4)` : `${f.audioBitrate}k (mp3)`,
          t: `/dl?t=${encrypt(
            JSON.stringify({
              v: 1,
              t: `${title} [${f.height ? `${f.height}p` : `${f.audioBitrate}k`}]`,
              u: f.url
            })
          )}`
        }))
    };

    resJson(200, 'success', res, [result]);
  } catch (unknownError) {
    resJson(500, unknownError?.message ?? unknownError, res);
  }
}

module.exports = v1;
