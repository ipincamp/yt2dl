/**
 * @name yt2dl
 * @version v1.0.8
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

const { default: axios } = require('axios');
const { validateURL } = require('ytdl-core');
const {
  myHead, toTime, encrypt, resJson
} = require('../utils');
const { apiSchema } = require('../validation');

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function v2(req, res) {
  try {
    /** validation */
    const { error, value } = apiSchema.validate(req.body);

    if (error) {
      resJson(400, error.details[0].message.replace(/"/g, "'"), res);
      return;
    }

    if (!validateURL(value.url)) {
      resJson(400, 'invalid url', res);
      return;
    }

    /** fill required input */
    const { data } = await axios({
      method: 'POST',
      headers: {
        'Content-Type': myHead.ct,
        Origin: 'https://www.y2mate.com',
        Referer: 'https://www.y2mate.com/',
        'User-Agent': myHead.ua
      },
      url: 'https://www.y2mate.com/mates/analyzeV2/ajax',
      data: `k_query=${encodeURIComponent(value.url)}&k_page=home&hl=en&q_auto=1`
    });

    /** wrap data */
    if (data?.status === 'ok' && data?.mess?.length === 0) {
      const formats = [];

      for (const ext of ['mp3', 'mp4']) {
        if (!data.links[ext]) continue;

        for (const format of Object.values(data.links[ext])) {
          if (!['mp3', 'mp4'].includes(format.f) || format.q === 'auto') continue;

          format.q = format.q.includes('k') ? `${parseInt(format.q, 10)}k (${format.f})` : `${format.q} (${format.f})`;
          format.t = `/dl?t=${encrypt(
            JSON.stringify({
              v: 2,
              t: `${data.title} [${`${format.q}`.split(' ')[0]}]`,
              k: `vid=${data.vid}&k=${encodeURIComponent(format.k)}`
            })
          )}`;

          delete format.f;
          delete format.k;
          delete format.q_text;
          delete format.size;

          formats.push(format);
        }
      }

      const result = {
        title: data.title,
        thumbnail: `https://i.ytimg.com/vi/${data.vid}/maxresdefault.jpg`,
        channel: data.a,
        duration: toTime(data.t),
        formats: formats.sort((a, b) => parseInt(a.q, 10) - parseInt(b.q, 10))
      };

      /** send as response */
      resJson(200, 'success', res, [result]);
      return;
    }

    resJson(404, 'not found', res);
  } catch (unknownError) {
    resJson(500, unknownError?.message ?? unknownError, res);
  }
}

module.exports = v2;
