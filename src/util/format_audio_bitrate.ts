/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

/**
 * Standardizes a given bitrate (in bits per second) to the closest standard MP3 bitrate (in kbps).
 *
 * @param bps - The bitrate in bits per second to standardize.
 * @returns The closest standard bitrate in kbps from the set [32, 48, 64, 96, 128, 160, 192, 224, 256, 320].
 */
export default (bps: number): number => {
  const standards: number[] = [32, 48, 64, 96, 128, 160, 192, 224, 256, 320];

  const rawKbps = bps / 1000;

  return standards.reduce((prev, curr) => {
    return Math.abs(curr - rawKbps) < Math.abs(prev - rawKbps) ? curr : prev;
  });
};
