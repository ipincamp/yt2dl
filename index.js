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
const { chain, forEach, last } = lodash;
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
/**
 * Parameter example
 * - /api?url=12345678901
 * - /api?url=https://youtu.be/12345678901
 * - /api?url=https://www.youtube.com/watch?v=12345678901
 * - /api?url=https://www.youtube.com/shorts/12345678901
 */
app.get(
  '/api',
  validate({
    query: Joi.object({ url: Joi.string().required() }),
  }),
  (req, res, next) => {
    const { url } = req.query;
    if (ID(url) === null) return res.sendStatus(400);
    if (ytdlcore.validateID(ID(url)) === true) {
      ytdlcore
        .getInfo(ID(url))
        .then(({ formats, videoDetails }) => {
          const resolutions = formats
            .filter((f) => f.hasAudio === false && f.hasVideo === true && f.videoCodec?.startsWith('avc1'))
            .map(({ fps, height }) => `${height}p${fps}`);
          const bitrate = chain(formats)
            .filter('hasAudio')
            .map('audioBitrate')
            .uniq()
            .orderBy(null, 'desc')
            .value();
          function durations() {
            let h = Math.floor(parseInt(videoDetails.lengthSeconds) / 3600);
            let m = Math.floor((parseInt(videoDetails.lengthSeconds) / 60) % 60);
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
            thumbnail: last(videoDetails.thumbnails).url,
            durations: durations(),
            channel: videoDetails.ownerChannelName,
            resolutions,
            bitrate,
          });
        })
        .catch((error) => next(error.message));
    } else {
      return res.sendStatus(404);
    }
  },
);
/**
 * Parameter examples
 * - Audio: /get?url=12345678901&typ=aud&bit=128
 * - Video: /get?url=12345678901&typ=vid&qty=1080p60&bit=128
 */
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
  (req, res, next) => {
    const { url, typ, qty } = req.query;
    if (ID(url) === null) return res.sendStatus(400);
    if (ytdlcore.validateID(ID(url)) === true) {
      ytdlcore
        .getInfo(ID(url))
        .then(({ formats, videoDetails }) => {
          const { title } = videoDetails;
          let audioItag;
          let sampleBit;
          let videoItag;
          let ffmpegLog = '';
          let queryFill = `${qty}_${req.query.bit}k`;
          const streams = {};
          if (typ === 'aud') {
            formats.forEach((f) => {
              if (f.audioBitrate === parseInt(req.query.bit)) {
                audioItag = f.itag;
                sampleBit = f.audioSampleRate;
              }
            });
            if (audioItag === undefined) return res.sendStatus(400);
            streams.aud = ytdlcore(ID(url), { quality: audioItag });
          }
          if (typ === 'vid') {
            const r = qty?.split('p');
            videoItag = chain(formats)
              .filter(({ fps, height }) => fps === parseInt(r[1]) && height === parseInt(r[0]))
              .map('itag')
              .orderBy(null, 'desc')
              .head()
              .value();
            if ((videoItag || audioItag) === undefined) return res.sendStatus(400);
            streams.aud = ytdlcore(ID(url), { quality: audioItag });
            streams.vid = ytdlcore(ID(url), { quality: videoItag });
          }
          const exts = {
            aud: 'mp3',
            vid: 'mp4',
          };
          const contentTypes = {
            aud: 'audio/mpeg',
            vid: 'video/mp4',
          };
          if (typ === 'aud') {
            queryFill = `${req.query.bit}k`;
          }
          const f = `${encodeURI(sanitize(title))}-[${queryFill}].${exts[typ]}`;
          res.setHeader('Content-Type', contentTypes[typ]);
          res.setHeader(
            'Content-Disposition',
            `attachment; filename=${f}; filename*=utf-8''${f}`,
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
              '-ar', `${sampleBit}`,
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
          forEach(streams, (stream, format) => {
            const dest = ffmpegProcess.stdio[pipes[format]];
            stream.pipe(dest).on('error', (e) => next(e.message));
          });
          ffmpegProcess.stdio[pipes.out].pipe(res);
          ffmpegProcess.stdio[pipes.err].on(
            'data',
            (chunk) => ffmpegLog += chunk.toString(),
          );
          ffmpegProcess.on('exit', (exitCode) => {
            if (exitCode === 1) {
              next(ffmpegLog);
            }
            res.end();
          });
          res.on('close', () => ffmpegProcess.kill());
        })
        .catch((error) => next(error.message));
    } else {
      return res.sendStatus(404);
    }
  },
);
app.listen(process.env.PORT || 8000);
