/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

import vali from 'express-validation';
import ytdl from 'ytdl-core';
import loda from 'lodash';
import ytpl from 'ytpl';

const { getInfo } = ytdl;
const { last } = loda;
const { Joi, validate } = vali;

function publish(str) {
  return str.split('-').reverse().join('/');
}

/**
 *
 * @param {import('express').Application} app
 */
export const funcAPI = (apps) => {
  apps.get(
    '/api',
    validate({
      query: Joi.object({
        id: Joi.string().required(),
      }),
    }),
    /**
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async (req, res, next) => {
      const { id } = req.query;

      try {
        await getInfo(id)
          .then(({ videoDetails, formats }) => {
            const {
              title,
              ownerChannelName,
              publishDate,
              thumbnails,
            } = videoDetails;

            const VorPTitle = title;
            const owner = ownerChannelName;
            const videoUploadDate = publish(publishDate);
            const thumbnail = last(thumbnails).url;
            const videoFormats = formats;

            res.json({
              VorPTitle,
              owner,
              videoUploadDate,
              thumbnail,
              videoFormats,
            });
          });
      } catch {
        await ytpl(id)
          .then((plDetails) => {
            const {
              title,
              author,
              estimatedItemCount,
              thumbnails,
              items,
            } = plDetails;

            const VorPTitle = title;
            const owner = author.name;
            const thumbnail = last(thumbnails).url;
            const plVideoLength = `${estimatedItemCount} video found`;
            const plVideoID = items.map((v) => v.id);

            res.json({
              VorPTitle,
              owner,
              plVideoLength,
              thumbnail,
              plVideoID,
            });
          })
          .catch((err) => next(err));
      }
    },
  );
};
