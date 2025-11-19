/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

import type { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import ytCore from '../core/yt_core.js';
import getVideoInfo from '../core/get_video_info.js';
import parseStreamingData from '../core/parse_streaming_data.js';

/**
 * Extracts the video ID from a YouTube URL.
 * @param url - The YouTube URL.
 * @returns The video ID or null if not found.
 */
function extractVideoId(url: string): string | null {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /^[a-zA-Z0-9_-]{11}$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Handles the video info request.
 * Fetches YouTube video information and returns formatted data.
 */
export default async function videoInfoHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { url } = req.query;

    // Validate URL parameter
    if (!url || typeof url !== 'string') {
      throw createHttpError(400, 'URL parameter is required');
    }

    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw createHttpError(400, 'Invalid YouTube URL');
    }

    // Fetch video information
    const videoInfo = await getVideoInfo(ytCore, videoId);

    // Extract relevant data
    const basicInfo = videoInfo.basic_info;
    const streamingData = parseStreamingData(videoInfo.streaming_data);

    // Group formats by type
    const bundleFormats =
      streamingData?.filter((format) => format.type === 'bundle') || [];
    const videoFormats =
      streamingData?.filter((format) => format.type === 'video') || [];
    const audioFormats =
      streamingData?.filter((format) => format.type === 'audio') || [];

    // Prepare response data
    const responseData = {
      title: basicInfo.title || 'Unknown Title',
      thumbnail: basicInfo.thumbnail?.pop()?.url ?? '',
      author: basicInfo.author || 'Unknown',
      duration: basicInfo.duration || 0,
      publishedDate: basicInfo.start_timestamp?.toISOString() || null,
      viewCount: basicInfo.view_count || 0,
      videoId: basicInfo.id || videoId,
      formats: {
        bundle: bundleFormats.map((format) => ({
          quality: format.label,
          codec: format.code,
          size: format.size,
          mime: format.mime,
          token: format.token,
        })),
        video: videoFormats.map((format) => ({
          quality: format.label,
          codec: format.code,
          size: format.size,
          mime: format.mime,
          token: format.token,
        })),
        audio: audioFormats.map((format) => ({
          quality: format.label,
          codec: format.code,
          bitrate: format.label,
          size: format.size,
          mime: format.mime,
          token: format.token,
        })),
      },
    };

    res.status(200).json({
      status: true,
      message: 'Video information retrieved successfully',
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
}
