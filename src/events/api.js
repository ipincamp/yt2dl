/**
 * @name yt2mp3
 * @version v1.0.2
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { Joi, validate } = require('express-validation');
const { last } = require('lodash');

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
      await ytdl
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
        });
    } catch {
      await ytpl(id)
        .then((details) => {
          let {
            author,
            estimatedItemCount,
            items,
            title,
            thumbnails,
            url,
          } = details;

          const owner = author.name;
          const thumbnail = last(thumbnails).url;
          let videos = [];

          items.forEach((v) => {
            videos.push(v.id, {
              owner: v.author.name,
              title: v.title,
              thumbnail: last(v.thumbnails).url,
            });
          });

          res.json({
            title,
            owner,
            url,
            estimatedItemCount,
            thumbnail,
            videos,
          });
        }).catch((err) => next(err));
    }
  },
};
