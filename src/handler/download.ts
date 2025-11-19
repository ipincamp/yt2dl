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
import { spawn } from 'child_process';
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

    // Get the streaming URL (await because decipher returns a Promise)
    const streamUrl = await selectedFormat.decipher(ytCore.session.player);

    // Determine if we need ffmpeg (for formats without both audio and video)
    const needsFfmpeg = selectedFormat.has_audio && selectedFormat.has_video;
    const hasDirectUrl = !!streamUrl;

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

    if (hasDirectUrl && !needsFfmpeg) {
      // Stream directly from CDN
      console.log(`Streaming directly from CDN for itag ${formatInfo.itag}`);

      const protocol = streamUrl.startsWith('https') ? https : http;

      protocol
        .get(streamUrl, (streamResponse) => {
          if (streamResponse.statusCode !== 200) {
            throw createHttpError(500, 'Failed to fetch video stream');
          }

          // Set content length if available
          if (streamResponse.headers['content-length']) {
            res.setHeader(
              'Content-Length',
              streamResponse.headers['content-length']
            );
          }

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
    } else {
      // Use ffmpeg for processing
      console.log(`Using ffmpeg for itag ${formatInfo.itag}`);

      // Check if format needs combining (has both audio and video)
      if (selectedFormat.has_audio && selectedFormat.has_video) {
        // Single stream with both audio and video
        const ffmpeg = spawn(
          'ffmpeg',
          [
            '-i',
            streamUrl,
            '-c',
            'copy',
            '-f',
            formatInfo.mime === 'mp4' ? 'mp4' : 'matroska',
            '-movflags',
            'frag_keyframe+empty_moov',
            'pipe:1',
          ],
          {
            stdio: ['pipe', 'pipe', 'pipe'],
          }
        );

        if (ffmpeg.stdout) {
          ffmpeg.stdout.pipe(res);
        }

        if (ffmpeg.stderr) {
          ffmpeg.stderr.on('data', (data: Buffer) => {
            console.error(`ffmpeg stderr: ${data.toString()}`);
          });
        }

        ffmpeg.on('error', (error: Error) => {
          console.error('ffmpeg error:', error);
          if (!res.headersSent) {
            res.status(500).json({
              status: false,
              message: 'Error processing video with ffmpeg',
            });
          }
        });

        ffmpeg.on('close', (code: number | null) => {
          if (code !== 0) {
            console.error(`ffmpeg exited with code ${code}`);
          }
        });
      } else {
        // For video-only or audio-only, stream directly
        const protocol = streamUrl.startsWith('https') ? https : http;

        protocol
          .get(streamUrl, (streamResponse) => {
            if (streamResponse.statusCode !== 200) {
              throw createHttpError(500, 'Failed to fetch stream');
            }

            if (streamResponse.headers['content-length']) {
              res.setHeader(
                'Content-Length',
                streamResponse.headers['content-length']
              );
            }

            streamResponse.pipe(res);

            streamResponse.on('error', (error) => {
              console.error('Stream error:', error);
              if (!res.headersSent) {
                res.status(500).json({
                  status: false,
                  message: 'Error streaming media',
                });
              }
            });
          })
          .on('error', (error) => {
            console.error('Request error:', error);
            if (!res.headersSent) {
              res.status(500).json({
                status: false,
                message: 'Error fetching media',
              });
            }
          });
      }
    }
  } catch (error) {
    next(error);
  }
}
