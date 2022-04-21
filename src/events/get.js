/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */
import cpsp from 'child_process';
import mpeg from 'ffmpeg-static';
import sani from 'sanitize-filename';
import vali from 'express-validation';
import ytdl from 'ytdl-core';

const { getInfo } = ytdl;
const { Joi, validate } = vali;
const { spawn } = cpsp;

export const funcGET = (apps) => {
  apps.get(
    '/get',
    validate({
      query: Joi.object({
        id: Joi.string().required(),
        fr: Joi.valid('video', 'audio'),
      }),
    }),
    async (req, res, next) => {
      const { id, fr } = req.query;

      await getInfo(id)
        .then(({ videoDetails }) => {
          const { title } = videoDetails;

          const audio = ytdl(id, { quality: 'highestaudio' });
          const streams = [audio];

          if (fr === 'video') {
          /*
          If you want to contribute to making the video quality selection,
          please go to pull request
          */
            const video = ytdl(id, { quality: 'highest' });
            streams.unshift(video);
          }



          const exts = {
            video: 'mp4',
            audio: 'mp3',
          };

          const contentTypes = {
            video: 'video/mp4',
            audio: 'audio/mpeg',
          };

          const ext = exts[fr];
          const contentType = contentTypes[fr];
          const filename = `yt2mp3 - ${encodeURI(sani(title))}.${ext}`;

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

          /*
          When you find a more efficient codec than mine,
          please go to pull request.
          */
          const ffmpegInputs = {
            video: [
              '-i', `pipe:${pipes.video}`,
              '-i', `pipe:${pipes.audio}`,
              '-map', '0:v',
              '-map', '1:a',
              '-c:v', 'copy',
              '-c:a', 'libmp3lame',
              '-crf', '18',
              '-preset', 'veryfast',
              '-movflags', 'frag_keyframe+empty_moov+faststart',
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
            ...ffmpegInputs[fr],
            '-loglevel', 'error',
            '-',
          ];

          const ffmpegProcess = spawn(
            mpeg,
            ffmpegOptions,
            {
              stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
            },
          );

          const ffmpegStreamError = (err) => console.error(err);
          
          streams.forEach((stream, i, a) => {
            if (a.length === 1) {
              i += 1; 
            }

            const dest = ffmpegProcess.stdio[i+3];
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

          ffmpegProcess.on('exit', (exitCode) => {
            if (exitCode === 1) {
              console.error(ffmpegLogs);
            }
            res.end();
          });

          res.on('close', () => ffmpegProcess.kill());
        }).catch((err) => next(err));
    },
  );
};
