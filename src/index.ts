/**
 * @name yt2dl
 * @version v1.0.7
 * @license GPL-3.0
 */

import express, { type Application, type NextFunction, type Request, type Response } from 'express'
import expressValidation from 'express-validation'
import ffmpegPath from 'ffmpeg-static'
import sanitize from 'sanitize-filename'
import ytdl from 'ytdl-core'
import { spawn } from 'child_process'
import { pipeline } from 'stream'
import { audioResolutions, videoResolutions } from './functions/resolutions'
import { type StreamObject } from './types'

const app: Application = express()
const { Joi, validate } = expressValidation

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req: Request, res: Response, next: NextFunction): void => {
  res.sendStatus(200)
})

/** Example video url:
 * https://www.youtube.com/watch?v=dQw4w9WgXcQ
 */
app.post(
  '/api',
  validate({
    body: Joi.object({
      id: Joi.string().min(11).required()
    })
  }),
  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body
    ytdl
      .getInfo(`https://www.youtube.com/watch?v=${id as string}`)
      .then(({ formats, videoDetails }) => {
        const { lengthSeconds, thumbnails, title } = videoDetails
        res.status(200).json({
          status: true,
          statusCode: 200,
          result: {
            videoId: id as string,
            videoTitle: title,
            videoDuration: +lengthSeconds,
            videoThumbnailUrl: thumbnails.pop()?.url as string,
            formats: {
              audio: audioResolutions(formats),
              video: videoResolutions(formats)
            }
          }
        })
      })
      .catch((error) => {
        res.status(500).json({
          status: false,
          statusCode: 500,
          result: [],
          message: error
        })
      })
  }
)

/** Example 30 second video url:
 * https://www.youtube.com/watch?v=NSAOrGb9orM
 */
app.post(
  '/stream',
  validate({
    body: Joi.object({
      id: Joi.string().min(11).required(),
      title: Joi.string().required(),
      format: Joi.valid('mp3', 'mp4').required(),
      audio: Joi.number().required(),
      video: Joi.when('format', {
        is: Joi.valid('mp4'),
        then: Joi.number().required()
      })
    })
  }),
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.body.id as string
    const title = req.body.title as string
    const format = req.body.format as 'mp3' | 'mp4'

    const streams: StreamObject = {
      mp4: null,
      mp3: null
    }

    if (format === 'mp4') {
      streams.mp4 = ytdl(id, { quality: +req.body.video })
    }
    streams.mp3 = ytdl(id, { quality: +req.body.audio })

    const contentTypes = {
      mp4: 'video/mp4',
      mp3: 'audio/mpeg'
    }

    const contentType = contentTypes[format]
    const fileName = `${encodeURI(sanitize(title))}.${format}`

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}; filename*=utf-8''${fileName}`)

    const ffmpegInputOptions = {
      mp4: [
        '-i',
        'pipe:3',
        '-i',
        'pipe:4',
        '-map',
        '0:v',
        '-map',
        '1:a',
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-movflags',
        'frag_keyframe+empty_moov',
        '-metadata',
        `Title="${title}"`,
        '-metadata',
        'Album="yt2dl"',
        '-f',
        'mp4'
      ],
      mp3: [
        '-i',
        'pipe:4',
        '-c:a',
        'libmp3lame',
        '-vn',
        '-ar',
        '44100',
        '-ac',
        '2',
        '-b:a',
        '192k',
        '-metadata',
        `Title="${title}"`,
        '-metadata',
        'Album="yt2dl"',
        '-f',
        'mp3'
      ]
    }

    const ffmpegOptions = [...ffmpegInputOptions[format], '-loglevel', 'error', '-']

    const ffmpegProcess = spawn(ffmpegPath as string, ffmpegOptions, {
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe']
    })

    const handleFFmpegStreamError = (err: Error): void => {
      console.error(err)
    }

    Object.entries(streams).forEach(([formats, stream]): void => {
      if (stream !== null) {
        const pipe = formats === 'mp4' ? 3 : 4
        const dest = ffmpegProcess.stdio[pipe]
        stream.pipe(dest).on('error', handleFFmpegStreamError)
      }
    })

    let ffmpegLogs = ''
    ffmpegProcess.stdio[2].on('data', (chunk: Buffer): void => {
      ffmpegLogs += chunk.toString()
    })

    ffmpegProcess.on('exit', (exitCode: number | null): void => {
      if (exitCode === 1) {
        console.error(ffmpegLogs)
      }
    })

    res.on('close', (): void => {
      ffmpegProcess.kill()
    })

    pipeline(ffmpegProcess.stdio[1], res, (err: NodeJS.ErrnoException | null): void => {
      if (err != null) {
        console.error('Error sending response:', err)
      }
    })
  }
)

app.listen(8000, () => {
  console.info('Listening Server on Port 8000')
})
