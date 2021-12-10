const express = require('express');
const ytdl = require('ytdl-core');
const { chain, last } = require('lodash');
const { Joi, validate } = require('express-validation');

const app = express();

const getResolutions = formats => chain(formats)
  .filter('height')
  .map('height')
  .uniq()
  .orderBy(null, 'desc')
  .value();

app.get(
  '/api/video',
  validate({
    query: Joi.object({
      id: Joi.string().required(),
    }),
  }),
  (req, res, next) => {
    const { id } = req.query;

    ytdl.getInfo(id)
      .then(({ videoDetails, formats }) => {
        const { title, thumbnails } = videoDetails;

        const thumbnailURL = last(thumbnails).url;

        const resolutions = getResolutions(formats);

        res.json({
          title,
          thumbnailURL,
          resolutions,
        });
      })
      .catch(err => next(err));
  },
);

const port = 8000;
app.listen(
  port,
  () => console.info(`Server listening on port: ${port}`),
);
