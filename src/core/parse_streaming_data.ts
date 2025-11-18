/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

import { encode_base64_url } from '../util/base_64.js';
import {
  get_media_category,
  type MediaCategory,
} from '../util/media_category.js';
import codec_label from '../util/codec_label.js';
import format_audio_bitrate from '../util/format_audio_bitrate.js';
import type { IStreamingData } from 'youtubei.js';
import format_size from '../util/format_size.js';

/**
 * Represents a single parsed streaming format.
 */
interface FormatsData {
  label: string;
  type: MediaCategory;
  size: string;
  mime: string;
  code: string;
  token: string;
}

/**
 * Type for parsed streaming data.
 */
export type StreamingData = FormatsData[] | undefined;

/**
 * Extracts the file extension from a MIME type string.
 * @param mimeType - The MIME type string.
 * @returns The file extension or an empty string.
 */
const getExtension = (mimeType?: string): string =>
  mimeType?.split(';')[0]?.split('/')[1] ?? '';

/**
 * Parses the provided streaming data and returns an array of formatted stream information.
 *
 * @param streamingData - Optional streaming data object containing available formats and adaptive formats.
 * @returns An array of `FormatsData` objects representing each available stream, or `undefined` if no data is provided.
 */
const parse_streaming_data = (
  streamingData?: IStreamingData
): StreamingData => {
  if (!streamingData) return undefined;

  const { formats = [], adaptive_formats = [] } = streamingData;
  const allFormats = [...formats, ...adaptive_formats];

  return allFormats.map((format): FormatsData => {
    const mimeType = format?.mime_type?.split(';')[0] ?? '';
    const extension = getExtension(format?.mime_type);
    const payload = `*itag>${format?.itag}*mime>${extension}`;

    /**
     * Generates a display label for the format.
     * @param format - The format object.
     * @returns The label string.
     */
    const getLabel = (): string => {
      if (format?.height) {
        let label = `${format.height}p`;
        if (format?.fps && format.fps !== 30) {
          label += format.fps;
        }
        return label;
      }
      if (format?.average_bitrate) {
        return `${format_audio_bitrate(format.average_bitrate)}k`;
      }
      return 'unknown';
    };

    return {
      label: getLabel(),
      mime: mimeType,
      size: format_size(format?.content_length ?? 0),
      type: get_media_category({
        has_audio: format?.has_audio,
        has_video: format?.has_video,
      }),
      code: codec_label(format?.mime_type),
      token: encode_base64_url(payload),
    };
  });
};

export default parse_streaming_data;
