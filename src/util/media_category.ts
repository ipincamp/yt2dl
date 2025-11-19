/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

interface MediaAttributes {
  has_audio: boolean;
  has_video: boolean;
}

export type MediaCategory = 'bundle' | 'video' | 'audio' | 'unknown';

/**
 * Determines the media category based on the presence of video and audio streams.
 *
 * @param media - An object containing media attributes, specifically `has_video` and `has_audio`.
 * @returns The media category as a string:
 * - `'bundle'` if both video and audio are present,
 * - `'video'` if only video is present,
 * - `'audio'` if only audio is present,
 * - `'unknown'` if neither video nor audio is present.
 */
export const get_media_category = (media: MediaAttributes): MediaCategory => {
  const { has_video, has_audio } = media;

  switch (true) {
    case has_video && has_audio:
      return 'bundle';
    case has_video && !has_audio:
      return 'video';
    case !has_video && has_audio:
      return 'audio';
    default:
      return 'unknown';
  }
};
