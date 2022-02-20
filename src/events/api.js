/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { Joi, validate } = require('express-validation');
const { last } = require('lodash');

function publish(str) {
  return str.split('-').reverse().join('/');
}

module.exports = {
  name: '/api',
  async run(req, res, next) {
    validate({
      query: Joi.object({
        id: Joi.string().required(),
      }),
    });
    const { id } = req.query;

    try {
      await ytdl.getInfo(id)
        .then(({ videoDetails, formats }) => {
          const {
            title,
            ownerChannelName,
            publishDate,
            thumbnails,
          } = videoDetails;

          const videoTitle = title;
          const videoOwner = ownerChannelName;
          const videoUploadDate = publish(publishDate);
          const videoThumbnail = last(thumbnails).url;
          const videoFormats = formats;

          res.json({
            videoTitle,
            videoOwner,
            videoUploadDate,
            videoThumbnail,
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

          const plTitle = title;
          const plOwner = author.name;
          const plThumbnail = last(thumbnails).url;
          const plVideoLength = estimatedItemCount;
          const plVideoID = items.map((v) => v.id);

          res.json({
            plTitle,
            plOwner,
            plVideoLength,
            plThumbnail,
            plVideoID,
          });
        })
        .catch((err) => next(err));
    }
  },
};
