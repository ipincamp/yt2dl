/* eslint-disable arrow-parens */
/* eslint-disable no-shadow */

/**
 * Import all required modules
 */
const express = require('express');
const ytdl = require('ytdl-core');
const { chain, last, forEach } = require('lodash');
const { Joi, validate } = require('express-validation');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const sanitize = require('sanitize-filename');

const app = express();

app.use(express.static('public'));

const getResolutions = formats => chain(formats)
  .filter('height')
  .map('height')
  .uniq()
  .orderBy(null, 'desc')
  .value();

/**
 * Get video information
 */
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

/**
 * Download event with get method
 */
app.get(
  '/download',
  validate({
    query: Joi.object({
      id: Joi.string().required(),
      format: Joi.valid('video', 'audio'),
      resolution: Joi.when(
        'format',
        {
          is: Joi.valid('video'),
          then: Joi.number().required(),
        },
      ),
    }),
  }),
  (req, res, next) => {
    const { id, format } = req.query;

    ytdl.getInfo(id)
      .then(({ videoDetails }) => {
        const { title } = videoDetails;

        const streams = {};

        // Select format type
        if (format === 'video') {
          streams.video = ytdl(id, { quality: 'highest' });
          streams.audio = ytdl(id, { quality: 'highestaudio' });
        }

        if (format === 'audio') {
          streams.audio = ytdl(id, { quality: 'highestaudio' });
        }

        // Define format extension
        const exts = {
          video: 'mp4',
          audio: 'mp3',
        };

        const contentTypes = {
          video: 'video/mp4',
          audio: 'audio/mpeg',
        };

        // Initialize filename
        const ext = exts[format];
        const contentType = contentTypes[format];
        const filename = `${encodeURI(sanitize(title))}.${ext}`;

        res.header('Content-Type', contentType);
        res.header('Content-Disposition', `attachment; filename=${filename}; filename*=utf-8''${filename}`);

        const pipes = {
          out: 1,
          err: 2,
          video: 3,
          audio: 4,
        };

        // Stream codec
        const ffmpegInputOptions = {
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
            '-ac', 2,
            '-b:a', '192k',
            '-f', 'mp3',
          ],
        };

        const ffmpegOptions = [
          ...ffmpegInputOptions[format],
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

        // Litle change for debug
        const handleFFmpegStreamError = (err) => {
          console.error(err);
        };

        forEach(streams, (stream, format) => {
          const dest = ffmpegProcess.stdio[pipes[format]];
          stream.pipe(dest).on('error', handleFFmpegStreamError);
        });

        ffmpegProcess.stdio[pipes.out].pipe(res);

        // Make sure no error found
        let ffmpegLogs = '';
        ffmpegProcess.stdio[pipes.err].on(
          'data',
          (chunk) => ffmpegLogs += chunk.toString(),
        );

        // End process
        ffmpegProcess.on(
          'exit',
          (exitCode) => {
            if (exitCode === 1) {
              console.error(ffmpegLogs);
            }
            res.end();
          },
        );
      })
      .catch(err => next(err));
  },
);

// Start event
const port = 5000;
app.listen(
  port,
  () => {
    console.log(`Server listening on port: ${port}`);
  },
);
