/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const ffmpeg = require('ffmpeg-static');
const sanitize = require('sanitize-filename');
const ytdl = require('ytdl-core');
const { Joi, validate } = require('express-validation');
const { spawn } = require('child_process');
const { forEach } = require('lodash');

module.exports = {
  name: '/playlist',
  run(req, res, next) {
    validate({
      query: Joi.object({
        list: Joi.array().required(),
      }),
    });

    const { list } = req.query;

    list.forEach((id) => {
      ytdl.getInfo(id)
        .then(({ videoDetails }) => {
          const { title } = videoDetails;

          let audio = ytdl(id, { quality: 'highestaudio' });

          const ffmpegProcess = spawn(ffmpeg, [
            '-loglevel', 'error', '-',
            '-i', 'pipe:3',
            '-c:a', 'libmp3lame',
            '-vn',
            '-ar', '44100',
            '-ac', '2',
            '-b:a', '192k',
            '-f', 'mp3',
          ], {
            stdio: [
              'inherit', 'inherit', 'inherit',
              /*
              input, output, error
              --------------------
              pipe:3, pipe:4, pipe:5
              */
              'pipe', 'pipe', 'pipe',
            ],
          });

          ffmpegProcess.on('close', () => {
            const ext = 'mp3';
            const contentType = 'audio/mpeg';
            const filename = `yt2mp3 - ${encodeURI(sanitize(title))}.${ext}`;

            res.setHeader('Content-Type', contentType);
            res.setHeader(
              'Content-Disposition',
              `attachment; filename=${filename}; filename*=utf-8''${filename}`,
            );
          });

          const ffmpegStreamError = (err) => console.error(err);
          forEach(audio, (stream) => {
            const dest = ffmpegProcess.stdio[4];
            stream.pipe(dest).on('error', ffmpegStreamError);
          });

          ffmpegProcess.stdio[4].pipe(res);

          let ffmpegLogs = '';
          ffmpegProcess.stdio[5].on('data', (chunk) => {
            ffmpegLogs += chunk.toString();
          });

          ffmpegProcess.on('exit', (exitCode) => {
            if (exitCode === 1) {
              return console.error(ffmpegLogs);
            }
            res.end();
          });
          res.on('close', () => {
            ffmpegProcess.kill();
          });
        }).catch((err) => next(err));
    });
  },
};
