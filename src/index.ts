/**
 * @name yt2dl
 * @version v1.0.6
 * @license GPL-3.0
 */

import express, { type Application, type Request, type Response, type NextFunction } from 'express'
import ffmpegPath from 'ffmpeg-static'
import sanitize from 'sanitize-filename'
import ytdl, { type videoFormat } from 'ytdl-core'
import { forEach } from 'lodash'
import { spawn } from 'child_process'
import { validate, Joi } from 'express-validation'
import { SQLite, Utils } from './class'
import { type Format } from './types'

/** Global Variables */
const app: Application = express()
const host: string = process.env.HOST ? process.env.HOST : 'http://localhost:8000'
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 8000
const regx: RegExp =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
const crud = new SQLite()
const util = new Utils()

/** Global Functions */
const forHMS = (duration: string): string => {
  const second = parseInt(duration, 10)
  const hours = Math.floor(second / 3600)
  const minutes = Math.floor(second / 60) % 60
  const seconds = second % 60
  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? `0${v}` : v))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':')
}
const sorter = (a: any, b: any): 1 | -1 | 0 => {
  const one = parseInt(a.label)
  const two = parseInt(b.label)
  if (one > two) {
    return -1
  } else if (one < two) {
    return 1
  } else {
    return 0
  }
}
const audio = (formats: videoFormat[], id: string): Format =>
  formats
    .filter((f) => !f.hasVideo && f.audioCodec?.startsWith('mp4a'))
    .map((v) => ({
      label: `${v.audioBitrate}k (.mp3)`,
      token: util.encrypt(
        JSON.stringify({
          id,
          ai: v.itag
        })
          .split('"')
          .join("'")
      )
    }))
const video = (formats: videoFormat[], id: string): Format =>
  formats
    .filter((f) => !f.hasAudio && f.videoCodec?.startsWith('avc1'))
    .map((v) => ({
      label: `${v.height}p${v.fps !== 30 ? v.fps : ''} (.mp4)`,
      token: util.encrypt(
        JSON.stringify({
          ...JSON.parse(util.decrypt(audio(formats, id)[0].token).split("'").join('"')),
          vi: v.itag
        })
          .split('"')
          .join("'")
      )
    }))

/** Express Routes */
app.all('/', (req, res, next) => {
  return res.sendStatus(200)
})

app.get(
  '/v1',
  validate({
    query: Joi.object({
      url: Joi.string().regex(regx).required()
    })
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url } = req.query
      const id = ytdl.getVideoID(url as string)
      if (await crud.check(id)) {
        const exist = await crud.read(id)
        if (util.cekexp(exist.exp)) {
          await crud.delet(id)
          return res.status(406).json({
            status: false,
            mesage: 'data expired. please request a new one'
          })
        }
        const result = JSON.parse(util.decrypt(exist.txt))
        return res.status(200).json({
          status: true,
          ...result
        })
      }
      const { formats, videoDetails } = await ytdl.getInfo(id)
      const result = {
        title: videoDetails.title,
        thumbnail: videoDetails.thumbnails.pop()?.url as string,
        channel: videoDetails.ownerChannelName,
        duration: forHMS(videoDetails.lengthSeconds),
        content: [...audio(formats, id), ...video(formats, id)].sort((a, b) => sorter(a, b))
      }
      await crud.create(['mid', 'exp', 'txt'], [id, util.setexp(4), util.encrypt(JSON.stringify(result))])
      return res.status(200).json({
        status: true,
        ...result
      })
    } catch (error) {
      next(error)
    }
  }
)

app.get(
  '/dl',
  validate({
    query: Joi.object({
      k: Joi.string().required()
    })
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const { k } = req.query
    const param = util.decrypt(k as string)
    if (param === '') {
      return res.status(400).json({
        status: false,
        mesage: 'invalid token'
      })
    }
    const { id, ai, vi } = JSON.parse(param.split("'").join('"'))

    if (!await crud.check(id)) {
      return res.status(400).json({
        status: false,
        mesage: 'data not found'
      })
    }
    const exist = await crud.read(id)
    if (util.cekexp(exist.exp)) {
      await crud.delet(id)
      return res.status(406).json({
        status: false,
        mesage: 'invalid token. please request a new one'
      })
    }
    const { title } = JSON.parse(util.decrypt(exist.txt))
    let typ: 'aud' | 'vid' = 'aud'
    const streams: { aud: any, vid?: any } = { aud: undefined }
    if (vi) {
      typ = 'vid'
      streams.vid = ytdl(id as string, { quality: vi as number })
    }
    streams.aud = ytdl(id as string, { quality: ai as number })
    const ext = vi ? 'mp4' : 'mp3'
    const contentType = vi ? 'video/mp4' : 'audio/mpeg'
    const fname = `${encodeURI(sanitize(title))}.${ext}`
    res.set('Content-Type', contentType)
    res.set('Content-Disposition', `attachment; filename="${fname}"; filename*=utf-8''${fname}`)
    const pipes = {
      out: 1,
      err: 2,
      vid: 3,
      aud: 4
    }
    const ffmpegInputOptions = {
      vid: [
        '-i', `pipe:${pipes.vid}`,
        '-i', `pipe:${pipes.aud}`,
        '-map', '0:v',
        '-map', '1:a',
        '-c:v', 'copy',
        '-c:a', 'libmp3lame',
        '-b:a', '128k',
        '-crf', '27',
        '-preset', 'veryfast',
        '-movflags', 'frag_keyframe+empty_moov',
        '-f', 'mp4'
      ],
      aud: [
        '-i', `pipe:${pipes.aud}`,
        '-c:a', 'libmp3lame',
        '-vn',
        '-ar', '44100',
        '-ac', '2',
        '-b:a', '128k',
        '-f', 'mp3'
      ]
    }
    const ffmpegOptions = [
      ...ffmpegInputOptions[typ],
      '-loglevel', 'error', '-'
    ]
    const ffmpegProcess = spawn(ffmpegPath as string, ffmpegOptions, {
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe']
    })

    type Pipes = 'out' | 'err' | 'vid' | 'aud'

    forEach(streams, (stream, format) => {
      const dest = ffmpegProcess.stdio[pipes[format as Pipes]]
      stream.pipe(dest)
    })
    let ffmpegLogs: any
    ffmpegProcess.stdio[pipes.out]?.pipe(res)
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    ffmpegProcess.stdio[pipes.err]?.on('data', (cnk) => (ffmpegLogs += cnk.toString()))
    ffmpegProcess.on('exit', (code) => {
      if (code === 1) {
        console.info(ffmpegLogs)
      }
      ffmpegProcess.kill()
      res.end()
    })
  }
)

/** Start Application */
app.listen(port, () => {
  console.info(host)
})
