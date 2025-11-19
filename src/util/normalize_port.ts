/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */
/**
 * Represents a normalized port value.
 * - string: named pipe
 * - number: port number
 * - boolean: false if invalid
 */
export type NormalizePort = string | number | false;

/**
 * Normalize a port into a number, string, or false.
 * @param val - The port value as a string (e.g., "3000" or "pipe").
 * @returns The port as a number if valid, the original string if named pipe, or false if invalid.
 */
export function normalize_port(val: string): NormalizePort {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // Named pipe
    return val;
  }

  if (port >= 0) {
    // Port number
    return port;
  }

  // Invalid port
  return false;
}
