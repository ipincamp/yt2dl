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
import { decode_base64_url } from '../util/base_64.js';

/**
 * Extracts the video ID from a YouTube URL.
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
 * Parses the format token to extract itag and mime type.
 */
function parseToken(token: string): { itag: number; mime: string } | null {
  try {
    const decoded = decode_base64_url(token);
    const itagMatch = decoded.match(/\*itag>(\d+)/);
    const mimeMatch = decoded.match(/\*mime>(\w+)/);

    if (!itagMatch || !mimeMatch) {
      return null;
    }

    return {
      itag: parseInt(itagMatch[1], 10),
      mime: mimeMatch[1],
    };
  } catch {
    return null;
  }
}

/**
 * Handles video/audio download requests.
 * Streams directly from CDN if available, otherwise uses ffmpeg for processing.
 */
export default async function downloadHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { url, token } = req.body;

    // Validate required parameters
    if (!url || typeof url !== 'string') {
      throw createHttpError(400, 'URL parameter is required');
    }

    if (!token || typeof token !== 'string') {
      throw createHttpError(400, 'Format token is required');
    }

    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw createHttpError(400, 'Invalid YouTube URL');
    }

    // Parse token to get format details
    const formatInfo = parseToken(token);
    if (!formatInfo) {
      throw createHttpError(400, 'Invalid format token');
    }

    // Fetch video information
    const videoInfo = await getVideoInfo(ytCore, videoId);
    const basicInfo = videoInfo.basic_info;

    // Find the requested format to get Metadata (Size, Mime, etc)
    const allFormats = [
      ...(videoInfo.streaming_data?.formats || []),
      ...(videoInfo.streaming_data?.adaptive_formats || []),
    ];

    const selectedFormat = allFormats.find(
      (format) => format.itag === formatInfo.itag
    );

    if (!selectedFormat) {
      throw createHttpError(404, 'Requested format not found');
    }

    console.log('Selected format details:', {
      itag: selectedFormat.itag,
      has_audio: selectedFormat.has_audio,
      has_video: selectedFormat.has_video,
      content_length: selectedFormat.content_length,
      mime_type: selectedFormat.mime_type,
    });

    // Generate filename
    const sanitizedTitle = (basicInfo.title || 'video')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100);
    const filename = `${sanitizedTitle}.${formatInfo.mime}`;

    // Set response headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader(
      'Content-Type',
      selectedFormat.mime_type?.split(';')[0] || 'video/mp4'
    );

    // Set content length ONLY if we are downloading a direct stream (no mixing required)
    // If the file is pre-mixed (like itag 18/22), content-length is valid.
    // If youtubei.js needs to mix video+audio on the fly, content-length is unpredictable.
    if (selectedFormat.content_length) {
      res.setHeader('Content-Length', String(selectedFormat.content_length));
    }

    console.log(
      `Downloading itag ${formatInfo.itag} (audio: ${selectedFormat.has_audio}, video: ${selectedFormat.has_video})`
    );

    try {
      const stream = await videoInfo.download({
        itag: selectedFormat.itag,
      });

      console.log('Download stream obtained, piping to client...');

      // Convert ReadableStream to Node.js Readable and pipe to response
      const { Readable } = await import('stream');
      const nodeStream = Readable.fromWeb(stream);

      nodeStream.pipe(res);

      // Handle stream errors
      nodeStream.on('error', (error: Error) => {
        console.error('Download stream error:', error);
        if (!res.headersSent) {
          // Jangan kirim JSON jika header sudah terkirim (file download sudah mulai)
          try {
            res.end();
          } catch {
            /* empty */
          }
        }
      });

      nodeStream.on('end', () => {
        console.log('Download completed successfully');
      });

      // Clean up if client disconnects
      res.on('close', () => {
        console.log('Client connection closed');
        nodeStream.destroy();
      });
    } catch (downloadError) {
      console.error('Download initiation error:', downloadError);

      let errorMessage = 'Failed to download video';
      if (downloadError instanceof Error) {
        errorMessage = downloadError.message;
        // Provide clearer error if FFMPEG is missing and needed (rare for itag 18, common for 1080p)
        if (errorMessage.toLowerCase().includes('ffmpeg')) {
          errorMessage =
            'Server error: FFMPEG is required on the server to process this format';
        }
      }

      throw createHttpError(500, errorMessage);
    }
  } catch (error) {
    next(error);
  }
}
