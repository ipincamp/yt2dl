/**
 * @name yt2dl
 * @version v1.0.6
 * @license GPL-3.0
 */

import express, { type Application, type Request, type Response, type NextFunction } from 'express'
import ytdl, { type videoFormat } from 'ytdl-core'
import { validate, Joi } from 'express-validation'
import { Utils } from './class'
import { type Format } from './types'

/** Global Variables */
const app: Application = express()
const host: string = process.env.HOST ? process.env.HOST : 'http://localhost:8000'
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 8000
const regx: RegExp =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
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
      const { formats, videoDetails } = await ytdl.getInfo(id)
      return res.status(200).json({
        status: true,
        title: videoDetails.title,
        thumbnail: videoDetails.thumbnails.pop()?.url as string,
        channel: videoDetails.ownerChannelName,
        duration: forHMS(videoDetails.lengthSeconds),
        content: [...audio(formats, id), ...video(formats, id)].sort((a, b) => sorter(a, b))
      })
    } catch (error) {
      next(error)
    }
  }
)

/** Start Application */
app.listen(port, () => {
  console.info(host)
})
