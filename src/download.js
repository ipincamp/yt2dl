/**
 * @name yt2dl
 * @version v1.0.8
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

const https = require('https');
const sanitize = require('sanitize-filename');
const { default: axios } = require('axios');
const { decrypt, myHead, resJson } = require('./utils');
const { dlSchema } = require('./validation');

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function download(req, res) {
  try {
    /** validation */
    const { error, value } = dlSchema.validate(req.query);

    if (error) {
      resJson(400, error.details[0].message.replace(/"/g, "'"), res);
      return;
    }

    /** decrypt token */
    const token = decrypt(value.t);

    if (!token.valid) {
      resJson(422, token.result, res);
      return;
    }

    /** filter api version */
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const jsonApi = JSON.parse(token.result);
    const ext = jsonApi.t.slice(-2, -1) === 'k' ? 'mp3' : 'mp4';
    const filename = `${encodeURI(sanitize(jsonApi.t))}.${ext}`;
    const contentType = ext === 'mp3' ? 'audio/mpeg' : 'video/mp4';

    if (jsonApi.v === 1) {
      /** API Version 1 */
      const stream = await axios({
        httpsAgent,
        method: 'GET',
        responseType: 'stream',
        url: jsonApi.u
      });
      const { data, headers } = stream;

      res.header('Content-Type', contentType);
      res.header('Content-Length', headers['content-length']);
      res.header('Content-Disposition', `attachment; filename=${filename}; filename*=utf-8''${filename}`);

      data.pipe(res);
      return;
    }

    if (jsonApi.v === 2) {
      /** API Version 2 */
      const jsonData = await axios({
        method: 'POST',
        headers: {
          'Content-Type': myHead.ct,
          Origin: 'https://www.y2mate.com',
          Referer: 'https://www.y2mate.com/',
          'User-Agent': myHead.ua
        },
        url: 'https://www.y2mate.com/mates/convertV2/index',
        data: jsonApi.k
      });

      if (jsonData.data?.c_status === 'CONVERTED' && jsonData.data?.mess.length === 0) {
        /** setup axios */
        const stream = await axios({
          httpsAgent,
          method: 'GET',
          responseType: 'stream',
          url: jsonData.data.dlink
        });
        const { data, headers } = stream;

        res.header('Content-Type', contentType);
        res.header('Content-Length', headers['content-length']);
        res.header('Content-Disposition', `attachment; filename=${filename}; filename*=utf-8''${filename}`);

        data.pipe(res);
        return;
      }

      resJson(500, 'please try again', res);
      return;
    }

    resJson(404, 'not found', res);
  } catch (unknownError) {
    resJson(500, unknownError?.message ?? unknownError, res);
  }
}

module.exports = download;
