/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

import { debug } from 'console';
import { AddressInfo } from 'net';

/**
 * Represents the possible types for a server address.
 */
export type ServerAddress = string | AddressInfo | null;

/**
 * Handles the server 'listening' event.
 * Logs the address or port the server is listening on.
 *
 * @param address - The address information of the server.
 * @throws Will throw an error if the address is null or undefined.
 */
export function on_listening(address: ServerAddress): void {
  if (!address) {
    throw new Error('Server address is not available.');
  }

  const bind =
    typeof address === 'string'
      ? `pipe ${address}`
      : `port ${(address as AddressInfo).port}`;
  debug(`Listening on ${bind}`);
}
