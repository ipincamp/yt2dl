/**
 * @name yt2mp3
 * @version v1.0.1
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const ffmpegPath = require('ffmpeg-static');
const sanitize = require('sanitize-filename');
const ytdl = require('ytdl-core');
const { Joi, validate } = require('express-validation');
const { forEach } = require('lodash');
const { spawn } = require('child_process');

module.exports = {
  name: '/convert',
  run(req, res, next) {
    validate({
      query: Joi.object({
        id: Joi.string().required(),
        format: Joi.valid('video', 'audio'),
      }),
    });

    const { id, format } = req.query;

    ytdl
      .getInfo(id)
      .then(({ videoDetails }) => {
        const { title } = videoDetails;

        const streams = {};

        if (format === 'video') {
          /**
           * If you want to contribute to making the video quality selection,
           * please go to pull request
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
        const filename = `yt2mp3 - ${encodeURI(sanitize(title))}.${ext}`;

        res.setHeader('Content-Type', contentType);
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filename}; filename*=utf-8''${filename}`,
        );

        const pipes = {
          out: 1,
          err: 2,
          video: 3,
          audio: 4,
        };

        /**
         * When you find a more efficient codec than mine,
         * please go to pull request.
         */
        const ffmpegInputs = {
          video: [
            '-i',
            `pipe:${pipes.video}`,
            '-i',
            `pipe:${pipes.audio}`,
            '-map',
            '0:v',
            '-map',
            '1:a',
            '-c:v',
            'copy',
            '-c:a',
            'libmp3lame',
            '-crf',
            '27',
            '-preset',
            'veryfast',
            '-movflags',
            'frag_keyframe+empty_moov',
            '-f',
            'mp4',
          ],
          audio: [
            '-i',
            `pipe:${pipes.audio}`,
            '-c:a',
            'libmp3lame',
            '-vn',
            '-ar',
            '44100',
            '-ac',
            '2',
            '-b:a',
            '192k',
            '-f',
            'mp3',
          ],
        };

        const ffmpegOptions = [
          ...ffmpegInputs[format],
          '-loglevel',
          'error',
          '-',
        ];

        const ffmpegProcess = spawn(ffmpegPath, ffmpegOptions, {
          stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
        });

        const ffmpegStreamError = (err) => console.error(err);

        forEach(streams, (stream, formatss) => {
          const dest = ffmpegProcess.stdio[pipes[formatss]];
          stream.pipe(dest).on('error', ffmpegStreamError);
        });

        ffmpegProcess.stdio[pipes.out].pipe(res);

        let ffmpegLogs = '';
        ffmpegProcess.stdio[pipes.err].on('data', (chunk) => {
          ffmpegLogs += chunk.toString();
        });

        ffmpegProcess.on('exit', (exitCode) => {
          if (exitCode === 1) {
            console.error(ffmpegLogs);
          }
          res.end();
        });

        res.on('close', () => ffmpegProcess.kill());
      })
      .catch((err) => next(err));
  },
};
