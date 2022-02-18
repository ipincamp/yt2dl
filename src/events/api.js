/**
 * @name yt2mp3
 * @version v1.0.3
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { Joi, validate } = require('express-validation');
const { last } = require('lodash');
const { urlFetch } = require('../..');

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
      await ytdl.getInfo(id).then(({ videoDetails, formats }) => {
        const {
          title, thumbnails, ownerChannelName, publishDate,
        } = videoDetails;
        const thumbnail = last(thumbnails).url;
        const owner = ownerChannelName;
        const videoFormats = formats;

        function invertDate(str) {
          return str.split('-').reverse().join('/');
        }

        const uploadDate = invertDate(publishDate);

        const linkMP3 = `${urlFetch}convert?id=${id}&format=audio`;
        const linkMP4 = `${urlFetch}convert?id=${id}&format=video`;

        res.json({
          title,
          owner,
          uploadDate,
          thumbnail,
          videoFormats,
          linkMP3,
          linkMP4,
        });
      });
    } catch {
      await ytpl(id)
        .then((details) => {
          let {
            author, items, title, thumbnails,
          } = details;

          const owner = author.name;
          const thumbnail = last(thumbnails).url;
          const videoList = items;
          let videos = [];

          items.forEach((v) => {
            videos.push([v.index, v.title, v.shortUrl]);
          });

          res.json({
            title, owner, thumbnail, videos, videoList,
          });
        })
        .catch((err) => next(err));
    }
  },
};
