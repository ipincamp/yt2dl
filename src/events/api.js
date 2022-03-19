/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

import loda from 'lodash';
import vali from 'express-validation';
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';

const { getInfo } = ytdl;
const { Joi, validate } = vali;
const { last } = loda;

function publish(str) {
  return str.split('-').reverse().join('/');
}

export const funcAPI = (apps) => {
  apps.get(
    '/api',
    validate({
      query: Joi.object({
        id: Joi.string().required(),
      }),
    }),
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
