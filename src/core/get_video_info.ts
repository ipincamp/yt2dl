/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

import type { Innertube, YT } from 'youtubei.js';

/**
 * Retrieves basic information for a YouTube video.
 *
 * @param yt - Instance of Innertube from youtubei.js.
 * @param videoId - YouTube video ID (11 characters).
 * @returns A promise that resolves to the video information object.
 * @throws Error if the video ID is invalid or fetching fails.
 */
export default async function getVideoInfo(
  yt: Innertube,
  videoId: string
): Promise<YT.VideoInfo> {
  // Validate video ID: must be 11 characters and match YouTube's pattern
  const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
  if (!videoIdPattern.test(videoId)) {
    throw new Error('Invalid YouTube video ID');
  }

  // Fetch and return video information
  return yt.getBasicInfo(videoId);
}
