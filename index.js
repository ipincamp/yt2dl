/**
 * @name yt2mp3
 * @version v1.0.1
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const express = require('express');
const ffmpegPath = require('ffmpeg-static');
const sanitize = require('sanitize-filename');
const ytdl = require('ytdl-core');
const { forEach, last } = require('lodash');
const { Joi, validate } = require('express-validation');
const { spawn } = require('child_process');

const app = express();
const portUse = process.env.PORT || 8000;

app.listen(portUse);
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.get(
  '/api',
  validate({
    query: Joi.object({
      id: Joi.string().required(),
    }),
  }),
  (req, res, next) => {
    /**
     * Example video link:
     * https://www.youtube.com/watch?v=o-3BfOV-XvY
     */
    const { id } = req.query;

    ytdl.getInfo(id).then(({ videoDetails }) => {
      const {
        title,
        thumbnails,
        ownerChannelName,
        publishDate,
      } = videoDetails;
      const thumbnail = last(thumbnails).url;
      const owner = ownerChannelName;

      function invertDate(str) {
        return str.split('-').reverse().join('-');
      }

      const uploadDate = invertDate(publishDate);

      res.json({
        title,
        owner,
        uploadDate,
        thumbnail,
      });
    }).catch((err) => next(err));
  },
);

app.get(
  '/convert',
  validate({
    query: Joi.object({
      id: Joi.string().required(),
      format: Joi.valid('video', 'audio'),
    }),
  }),
  (req, res, next) => {
    const { id, format } = req.query;

    ytdl.getInfo(id).then(({ videoDetails }) => {
      const { title } = videoDetails;

      const streams = {};

      if (format === 'video') {
        /**
         * If you want to contribute to making the video quality selection,
         * contact me on discord or send an email above.
         *
         * Discord: ipincamp#4779
         *
         */
        streams.video = ytdl(id, { quality: 'highestvideo' });
        streams.audio = ytdl(id, { quality: 'highestaudio' });
      }

      if (format === 'audio') {
        streams.audio = ytdl(id, { quality: 'highestaudio' });
      }

      const exts = {
        video: 'mp4',
        audio: 'mp3',
      };

      const contentTypes = {
        video: 'video/mp4',
        audio: 'audio/mpeg',
      };

      const ext = exts[format];
      const contentType = contentTypes[format];
      const filename = `ytdl.nur-arifin.my.id - ${encodeURI(sanitize(title))}.${ext}`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${filename}; filename*=utf-8''${filename}`);

      const pipes = {
        out: 1,
        err: 2,
        video: 3,
        audio: 4,
      };

      /**
       * When you find a more efficient codec than mine,
       * please go to pull request or contact me.
       */
      const ffmpegInputs = {
        video: [
          '-i', `pipe:${pipes.video}`,
          '-i', `pipe:${pipes.audio}`,
          '-map', '0:v',
          '-map', '1:a',
          '-c:v', 'copy',
          '-c:a', 'libmp3lame',
          '-crf', '27',
          '-preset', 'veryfast',
          '-movflags', 'frag_keyframe+empty_moov',
          '-f', 'mp4',
        ],
        audio: [
          '-i', `pipe:${pipes.audio}`,
          '-c:a', 'libmp3lame',
          '-vn',
          '-ar', '44100',
          '-ac', '2',
          '-b:a', '192k',
          '-f', 'mp3',
        ],
      };

      const ffmpegOptions = [
        ...ffmpegInputs[format],
        '-loglevel', 'error',
        '-',
      ];

      const ffmpegProcess = spawn(
        ffmpegPath,
        ffmpegOptions,
        {
          stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
        },
      );

      const ffmpegStreamError = (err) => console.error(err);

      forEach(streams, (stream, formatss) => {
        const dest = ffmpegProcess.stdio[pipes[formatss]];
        stream.pipe(dest).on('error', ffmpegStreamError);
      });

      ffmpegProcess.stdio[pipes.out].pipe(res);

      let ffmpegLogs = '';
      ffmpegProcess.stdio[pipes.err].on(
        'data',
        (chunk) => {
          ffmpegLogs += chunk.toString();
        },
      );

      ffmpegProcess.on(
        'exit',
        (exitCode) => {
          if (exitCode === 1) {
            console.error(ffmpegLogs);
          }
          res.end();
        },
      );

      res.on(
        'close',
        () => ffmpegProcess.kill(),
      );
    }).catch((err) => next(err));
  },
);
