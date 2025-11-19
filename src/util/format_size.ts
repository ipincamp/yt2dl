/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

/**
 * Formats a number of bytes as a human-readable string with appropriate units.
 *
 * @param bytes - The number of bytes to format.
 * @param decimals - The number of decimal places to include (default is 2).
 * @returns A string representing the formatted size (e.g., "1.23 MB").
 *
 * @remarks
 * This function converts a byte value into a string with units ranging from bytes (B) to petabytes (PB),
 * using a base of 1024. If the input is 0, it returns "0 B".
 */
export default (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${value} ${sizes[i]}`;
};
