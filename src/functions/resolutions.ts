import { type Resolutions } from '../types'
import type ytdl from 'ytdl-core'

const audioResolutions = (formats: ytdl.videoFormat[]): Resolutions[] =>
  formats
    .filter(({ hasVideo, audioCodec }) => !hasVideo && audioCodec?.startsWith('mp4a'))
    .map(({ audioBitrate, itag }) => ({ id: itag, quality: audioBitrate as number }))

const videoResolutions = (formats: ytdl.videoFormat[]): Resolutions[] =>
  formats
    .filter(({ hasAudio, videoCodec }) => !hasAudio && videoCodec?.startsWith('avc1'))
    .map(({ height, itag }) => ({ id: itag, quality: height as number }))

export { audioResolutions, videoResolutions }
