/**
 * @name yt2dl
 * @version v1.0.5
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

import cors from 'cors';
import cp from 'child_process';
import expres from 'express';
import ffmpeg from 'ffmpeg-static';
import lodash from 'lodash';
import valids from 'express-validation';
import sanitize from 'sanitize-filename';
import ytdlcore from 'ytdl-core';

const app = expres();
const { forEach } = lodash;
const { Joi, validate } = valids;
const { spawn } = cp;

/**
 *
 * @param {string} url - YouTube URL
 * @returns {string | null}
 */
const ID = (url) => {
  if (url.length === 11) {
    return url;
  }
  if (url.includes('youtu.be')) {
    const id = url.split('be/')[1].slice(0, 11);
    if (id.length === 11) {
      return id;
    }
    return null;
  }
  if (url.includes('youtube.com/shorts')) {
    const id = url.split('ts/')[1].slice(0, 11);
    if (id.length === 11) {
      return id;
    }
    return null;
  }
  if (url.includes('youtube.com/watch')) {
    const id = url.split('?v=')[1].slice(0, 11);
    if (id.length === 11) {
      return id;
    }
    return null;
  }
  return null;
};

app.use(cors());
app.use(expres.static('public'));
app.get('/', (req, res) => res.sendStatus(200));
app.get(
  '/api',
  validate({
    query: Joi.object({ url: Joi.string().required() }),
  }),
  (req, res) => {
    const { url } = req.query;
    if (ID(url) === null || url === undefined) {
      return res.json({
        status: false,
        error: '❌ Input url or ID must contain domain from YouTube!',
      });
    }
    if (ytdlcore.validateID(ID(url)) === true) {
      ytdlcore
        .getInfo(ID(url))
        .then(({ formats, videoDetails }) => {
          const resolutions = formats
            .filter(
              (f) => f.hasAudio === false
                && f.hasVideo === true
                && f.videoCodec?.startsWith('avc1'),
            )
            .map((f) => `${f.height}p${f.fps}`)
            .sort((a, b) => b - a);
          const bitrate = formats
            .filter((f) => f.hasAudio === true)
            .map((f) => f.audioBitrate)
            .sort((a, b) => b - a);
          function durations() {
            let h = Math.floor(parseInt(videoDetails.lengthSeconds) / 3600);
            let m = Math.floor(
              (parseInt(videoDetails.lengthSeconds) / 60) % 60,
            );
            let s = parseInt(videoDetails.lengthSeconds) % 60;
            if (h === 0 || h < 10) {
              h = `0${h}`;
            }
            if (m === 0 || m < 10) {
              m = `0${m}`;
            }
            if (s === 0 || s < 10) {
              s = `0${s}`;
            }
            return `${h}:${m}:${s}`;
          }
          res.status(200).json({
            title: videoDetails.title,
            thumbnail: videoDetails.thumbnails.pop().url,
            durations: durations(),
            channel: videoDetails.ownerChannelName,
            resolutions,
            bitrate,
          });
        })
        .catch((error) => res.json({
          status: false,
          error: `❌ ${error.message}`,
        }));
    } else {
      return res.json({
        status: false,
        error: '❌ Video not found.',
      });
    }
  },
);
app.get(
  '/get',
  validate({
    query: Joi.object({
      url: Joi.string().required(),
      typ: Joi.valid('aud', 'vid'),
      bit: Joi.when('typ', {
        is: Joi.valid('aud', 'vid'),
        then: Joi.number().required(),
      }),
      qty: Joi.when('typ', {
        is: Joi.valid('vid'),
        then: Joi.string().required(),
      }),
    }),
  }),
  (req, res) => {
    const { url, typ, qty } = req.query;
    if (ID(url) === null) {
      return res.json({
        status: false,
        error: '❌ Input url or ID must contain domain from YouTube!',
      });
    }
    if (ytdlcore.validateID(ID(url)) === true) {
      ytdlcore
        .getInfo(ID(url))
        .then(({ formats, videoDetails }) => {
          const { title } = videoDetails;
          const streams = {};

          let mark = `${req.query.bit}k`;

          const audio = () => {
            let itag = 0;
            let bit = 0;
            formats.forEach((f) => {
              if (f.audioBitrate === parseInt(req.query.bit)) {
                itag = f.itag;
                bit = f.audioSampleRate;
              }
            });
            return { itag, bit };
          };

          if (typ === 'aud') {
            if (audio().itag === 0) {
              return res.json({
                status: false,
                error: '❌ Audio bitrate not found.',
              });
            }
            streams.aud = ytdlcore(ID(url), { quality: audio().itag });
          }

          if (typ === 'vid') {
            mark += `_${qty}`;
            const r = qty?.split('p');
            let itag = 0;
            formats.forEach((f) => {
              if (f.fps === parseInt(r[1]) && f.height === parseInt(r[0])) {
                itag = f.itag;
              }
            });
            if ((audio().itag || itag) === 0) {
              return res.json({
                status: false,
                error: '❌ Video resolution or audio bitrate not found.',
              });
            }
            streams.aud = ytdlcore(ID(url), { quality: audio().itag });
            streams.vid = ytdlcore(ID(url), { quality: itag });
          }
          const exts = {
            aud: 'mp3',
            vid: 'mp4',
          };
          const contentTypes = {
            aud: 'audio/mpeg',
            vid: 'video/mp4',
          };
          const filename = `${encodeURI(sanitize(title))}-[${mark}].${
            exts[typ]
          }`;
          res.setHeader('Content-Type', contentTypes[typ]);
          res.setHeader(
            'Content-Disposition',
            `attachment; filename=${filename}; filename*=utf-8''${filename}`,
          );
          const pipes = {
            out: 1,
            err: 2,
            aud: 3,
            vid: 4,
          };
          const ffmpegInputOptions = {
            aud: [
              '-i', `pipe:${pipes.aud}`,
              '-c:a', 'libmp3lame',
              '-vn',
              '-ar', `${audio().bit}`,
              '-ac', '2',
              '-b:a', `${req.query.bit}k`,
              '-f', 'mp3',
            ],
            vid: [
              '-i', `pipe:${pipes.vid}`,
              '-i', `pipe:${pipes.aud}`,
              '-map', '0:v',
              '-map', '1:a',
              '-c:v', 'copy',
              '-c:a', 'libmp3lame',
              '-crf', '27',
              '-preset', 'veryfast',
              '-movflags', 'frag_keyframe+empty_moov',
              '-f', 'mp4',
            ],
          };
          const ffmpegOptions = [
            ...ffmpegInputOptions[typ],
            '-loglevel', 'error', '-',
          ];
          const ffmpegProcess = spawn(ffmpeg, ffmpegOptions, {
            stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
          });
          let ffmpegLog = '';
          forEach(streams, (stream, format) => {
            const dest = ffmpegProcess.stdio[pipes[format]];
            stream.pipe(dest).on('error', (e) => res.json({
              status: false,
              error: `❌ ${e.message}`,
            }));
          });
          ffmpegProcess.stdio[pipes.out].pipe(res);
          ffmpegProcess.stdio[pipes.err].on(
            'data',
            (chunk) => (ffmpegLog += chunk.toString()),
          );
          ffmpegProcess.on('exit', (exitCode) => {
            if (exitCode === 1) {
              return res.json({
                status: false,
                error: `❌ ${ffmpegLog}`,
              });
            }
            ffmpegProcess.kill();
            res.end();
          });
        })
        .catch((error) => res.json({
          status: false,
          error: `❌ ${error.message}`,
        }));
    } else {
      return res.json({
        status: false,
        error: '❌ Video not found.',
      });
    }
  },
);
app.listen(process.env.PORT || 8000);
