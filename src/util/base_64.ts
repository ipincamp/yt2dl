/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

/**
 * Encodes a UTF-8 string into its Base64 representation.
 *
 * @param str - The input string to encode.
 * @returns The Base64-encoded string.
 */
export const encode_base64 = (str: string): string => {
  return Buffer.from(str, 'utf-8').toString('base64');
};

/**
 * Decodes a base64-encoded string into a UTF-8 string.
 *
 * @param base64 - The base64-encoded string to decode.
 * @returns The decoded UTF-8 string.
 */
export const decode_base64 = (base64: string): string => {
  return Buffer.from(base64, 'base64').toString('utf-8');
};

/**
 * Encodes a string into a URL-safe Base64 format.
 *
 * This function first encodes the input string using standard Base64 encoding,
 * then replaces characters to make the result URL-safe:
 * - Replaces '+' with '-'
 * - Replaces '/' with '_'
 * - Removes any trailing '=' padding characters
 *
 * @param str - The input string to encode.
 * @returns The URL-safe Base64 encoded string.
 */
export const encode_base64_url = (str: string): string => {
  let base64 = encode_base64(str);

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * Decodes a base64url-encoded string into its original string representation.
 *
 * This function converts a base64url-encoded string (which uses '-' and '_' instead of '+' and '/')
 * to standard base64 encoding, adds necessary padding, and then decodes it.
 *
 * @param base64Url - The base64url-encoded string to decode.
 * @returns The decoded string.
 *
 * @remarks
 * Requires a `decode_base64` function to perform the actual base64 decoding.
 */
export const decode_base64_url = (base64Url: string): string => {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }

  return decode_base64(base64);
};
