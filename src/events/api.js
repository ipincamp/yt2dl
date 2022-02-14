/**
 * @name yt2mp3
 * @version v1.0.1
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const ytdl = require('ytdl-core');
const { Joi, validate } = require('express-validation');
const { last } = require('lodash');

module.exports = {
  name: '/api',
  run(req, res, next) {
    validate({
      query: Joi.object({
        id: Joi.string().required(),
      }),
    });
    const { id } = req.query;

    ytdl
      .getInfo(id)
      .then(({ videoDetails }) => {
        const {
          title, thumbnails, ownerChannelName, publishDate,
        } = videoDetails;
        const thumbnail = last(thumbnails).url;
        const owner = ownerChannelName;

        function invertDate(str) {
          return str.split('-').reverse().join('/');
        }

        const uploadDate = invertDate(publishDate);

        res.json({
          title,
          owner,
          uploadDate,
          thumbnail,
        });
      })
      .catch((err) => next(err));
  },
};
