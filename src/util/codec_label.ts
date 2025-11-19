/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

/**
 * Extracts the codec label from a given MIME type string.
 *
 * @param mimeType - The MIME type string that may contain a codec specification (e.g., 'video/mp4; codecs="avc1.42E01E"').
 * @returns The extracted codec label if found; otherwise, returns 'unknown'.
 *
 * @example
 * ```typescript
 * const codec = getCodecLabel('video/mp4; codecs="avc1.42E01E"');
 * // codec === 'avc1.42E01E'
 * ```
 */
export default (mimeType: string): string => {
  const regex = /codecs="?([^".]+)/;

  const match = mimeType.match(regex);

  return match && match[1] ? match[1] : 'unknown';
};
