/**
 * @name yt2dl
 * @version 1.0.9
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

const { default: axios } = require('axios');
const { validateURL } = require('ytdl-core');
const { contentType, userAgent } = require('../utils/env');
const { toTime } = require('../utils/dateTime');
const apiValidation = require('../utils/apiValidation');
const resJson = require('../utils/resJson');
const encrypt = require('../utils/encrypt');

/**
 *
 * @param {string} url
 */
async function fetchY2mateApi(url) {
  const { data } = await axios({
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      Origin: 'https://www.y2mate.com',
      Referer: 'https://www.y2mate.com/',
      'User-Agent': userAgent,
    },
    url: 'https://www.y2mate.com/mates/analyzeV2/ajax',
    data: `k_query=${encodeURIComponent(url)}&k_page=home&hl=en&q_auto=1`,
  });

  return data;
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

    const data = await fetchY2mateApi(value.url);
    if (!(data.status === 'ok' && data.mess.length === 0)) {
      resJson(res, 404, 'not found');
      return;
    }

    const formats = [];
    for (const ext of ['mp3', 'mp4']) {
      if (!data.links[ext]) continue;

      for (const format of Object.values(data.links[ext])) {
        const { f, q, k } = format;

        if (!['mp3', 'mp4'].includes(f) || q === 'auto') continue;

        const quality = q.includes('k')
          ? `${parseInt(q, 10)}k (${f})`
          : `${q} (${f})`;
        const token = JSON.stringify({
          v: 2,
          t: `vid=${data.vid}&k=${encodeURIComponent(k)} [${quality.split(' ')[0]}]`,
        });

        formats.push({
          q: quality,
          t: encrypt(token),
        });
      }
    }

    const result = {
      title: data.title,
      thumbnail: `https://i.ytimg.com/vi/${data.vid}/maxresdefault.jpg`,
      channel: data.a,
      duration: toTime(+data.t),
      formats: formats.sort((a, b) => parseInt(a.q, 10) - parseInt(b.q, 10)),
    };

    resJson(res, 200, 'success', result);
  } catch (error) {
    resJson(res, 500, error?.message ?? 'unknown errors');
  }
};
