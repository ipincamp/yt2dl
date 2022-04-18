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
const { forEach, last } = lodash;
const { Joi, validate } = valids;
const { spawn } = cp;

function getId(url) {
  function onlyId(s) {
    const a = url.split(s)[1].slice(0, 11);
    if (a.length !== 11) {
      return null;
    }
    return a;
  }
  if (url.length === 11) {
    return url;
  }
  if (url.includes('youtu.be')) {
    onlyId('be/');
  }
  if (url.includes('youtube.com/watch')) {
    onlyId('?v=');
  }
  if (url.includes('youtube.com/shorts')) {
    onlyId('ts/');
  }
  return null;
}

function getQuality(formats, select) {
  const res = {
    fps: 0,
    height: 0,
    heights: [],
    itag: 0,
  };
  if (select !== undefined) {
    res.fps = parseInt(select.split('p')[1]);
    res.height = parseInt(select.split('p')[0]);
  }
  formats.forEach((f) => {
    if (
      f.hasAudio === false
      && f.hasVideo === true
      && f.videoCodec?.startsWith('avc1')
    ) {
      res.heights.push(`${f.height}p${f.fps}`);
      if (res.fps === f.fps && res.height === f.height) {
        res.itag = f.itag;
      }
    }
  });
  return res;
}

app.use(cors());
app.get('/', (req, res) => res.sendStatus(200));
app.get(
  '/api',
  validate({
    query: Joi.object({ url: Joi.string().required() }),
  }),
  (req, res, next) => {
    const { url } = req.query;
    if (getId(url) === null) {
      res.status(400).json({
        status: false,
        input: url,
        error: 'invalid input',
      });
      return;
    }
    ytdlcore
      .getInfo(getId(url))
      .then(({ videoDetails, formats }) => {
        res.status(200).json({
          status: true,
          input: url,
          results: {
            url: videoDetails.video_url,
            title: videoDetails.title,
            description: videoDetails.description,
            thumbnail: last(videoDetails.thumbnails).url,
            duration: parseInt(videoDetails.lengthSeconds),
            category: videoDetails.category,
            publishdate: videoDetails.publishDate,
            likes: parseInt(videoDetails.likes),
            dislikes: parseInt(videoDetails.dislikes),
            views: parseInt(videoDetails.viewCount),
            private: videoDetails.isPrivate,
            channelname: videoDetails.ownerChannelName,
            channelurl: videoDetails.ownerProfileUrl,
            resolutions: getQuality(formats).heights,
          },
        });
      })
      .catch((error) => next(error));
  },
);
app.get(
  '/get',
  validate({
    query: Joi.object({
      url: Joi.string().required(),
      type: Joi.valid('video', 'audio'),
      reso: Joi.when('type', {
        is: Joi.valid('video'),
        then: Joi.string().required(),
      }),
    }),
  }),
  (req, res, next) => {
    const { url, type } = req.query;
    if (getId(url) === null || !req.query.reso.includes('p')) {
      res.status(400).json({
        status: false,
        input: url,
        error: 'invalid input',
      });
      return;
    }
    ytdlcore
      .getInfo(getId(url))
      .then(({ formats, videoDetails }) => {
        const { title } = videoDetails;
        const streams = {};
        if (type === 'audio') {
          streams.audio = ytdlcore(getId(url), { quality: 'highestaudio' });
        }
        if (type === 'video') {
          const { itag } = getQuality(formats, req.query.reso);
          if (itag === 0) {
            return res.status(404).json({
              status: false,
              input: url,
              error: 'invalid resolution',
            });
          }
          streams.video = ytdlcore(getId(url), { quality: itag });
          streams.audio = ytdlcore(getId(url), { quality: 'highestaudio' });
        }
        const exts = { video: 'mp4', audio: 'mp3' };
        const contentTypes = { video: 'video/mp4', audio: 'audio/mpeg' };
        const ext = exts[type];
        const contentType = contentTypes[type];
        const name = `${encodeURI(sanitize(title))}-${req.query.reso}.${ext}`;
        res.setHeader('Content-Type', contentType);
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${name}; filename*=utf-8''${name}`,
        );
        const pipes = {
          out: 1,
          err: 2,
          video: 3,
          audio: 4,
        };
        const ffmpegInputOptions = {
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
          ...ffmpegInputOptions[type],
          '-loglevel',
          'error',
          '-',
        ];
        const ffmpegProcess = spawn(ffmpeg, ffmpegOptions, {
          stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
        });
        const ffmpegStreamError = (e) => console.error(e);
        forEach(streams, (stream, format) => {
          const dest = ffmpegProcess.stdio[pipes[format]];
          stream.pipe(dest).on('error', ffmpegStreamError);
        });
        let logs = '';
        ffmpegProcess.stdio[pipes.out].pipe(res);
        ffmpegProcess.stdio[pipes.err].on(
          'data',
          (chunk) => (logs += chunk.toString()),
        );
        ffmpegProcess.on('exit', (exitCode) => {
          if (exitCode === 1) {
            console.info(logs);
          }
          res.end();
        });
      })
      .catch((error) => next(error));
  },
);
app.listen(process.env.PORT || 8000);
