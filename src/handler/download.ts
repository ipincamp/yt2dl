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
import https from 'https';
import http from 'http';

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

    // Find the requested format
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
      url: selectedFormat.url,
      cipher: selectedFormat.cipher,
      signature_cipher: selectedFormat.signature_cipher,
    });

    // Get the streaming URL
    let streamUrl: string;

    try {
      // Check if format has a direct URL or needs deciphering
      if (selectedFormat.url) {
        streamUrl = selectedFormat.url;
        console.log('Using direct URL');
      } else if (selectedFormat.cipher || selectedFormat.signature_cipher) {
        // Decipher the URL
        streamUrl = await selectedFormat.decipher(ytCore.session.player);
        console.log('URL deciphered successfully');
      } else {
        throw new Error('No URL or cipher available for this format');
      }
    } catch (error) {
      console.error('Error getting stream URL:', error);
      throw createHttpError(
        500,
        `Failed to get stream URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    if (!streamUrl) {
      throw createHttpError(500, 'No valid stream URL obtained');
    }

    console.info('Stream URL obtained:', streamUrl.substring(0, 100) + '...');

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

    // Stream directly from YouTube CDN
    // All formats (bundle, video-only, audio-only) can be streamed directly
    console.log(
      `Streaming directly from CDN for itag ${formatInfo.itag} (audio: ${selectedFormat.has_audio}, video: ${selectedFormat.has_video})`
    );

    const protocol = streamUrl.startsWith('https') ? https : http;

    const makeRequest = (url: string, redirectCount = 0): void => {
      if (redirectCount > 5) {
        console.error('Too many redirects');
        if (!res.headersSent) {
          res.status(500).json({
            status: false,
            message: 'Too many redirects',
          });
        }
        return;
      }

      const currentProtocol = url.startsWith('https') ? https : http;

      currentProtocol
        .get(url, (streamResponse) => {
          const statusCode = streamResponse.statusCode || 0;

          // Handle redirects (301, 302, 303, 307, 308)
          if (
            statusCode >= 300 &&
            statusCode < 400 &&
            streamResponse.headers.location
          ) {
            console.log(
              `Following redirect (${statusCode}) to: ${streamResponse.headers.location.substring(0, 100)}...`
            );
            streamResponse.resume(); // Consume response to free up memory
            makeRequest(streamResponse.headers.location, redirectCount + 1);
            return;
          }

          if (statusCode !== 200) {
            console.error(`Stream response status: ${statusCode}`);
            if (!res.headersSent) {
              res.status(500).json({
                status: false,
                message: `Failed to fetch video stream: ${statusCode}`,
              });
            }
            return;
          }

          // Set content length if available
          if (streamResponse.headers['content-length']) {
            res.setHeader(
              'Content-Length',
              streamResponse.headers['content-length']
            );
          }

          console.log('Starting stream pipe to client...');

          // Pipe the stream to response
          streamResponse.pipe(res);

          // Handle errors
          streamResponse.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
              res.status(500).json({
                status: false,
                message: 'Error streaming video',
              });
            }
          });

          streamResponse.on('end', () => {
            console.log('Stream completed successfully');
          });
        })
        .on('error', (error) => {
          console.error('Request error:', error);
          if (!res.headersSent) {
            res.status(500).json({
              status: false,
              message: 'Error fetching video',
            });
          }
        });
    };

    // Start the request
    makeRequest(streamUrl);
  } catch (error) {
    next(error);
  }
}
