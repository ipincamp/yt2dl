/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

import http from 'http';
import on_error from './on_error.js';
import { on_listening } from './on_listening.js';

export type Server = http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

export default (server: Server) => {
  server.on('error', on_error);
  server.on('listening', () => on_listening(server.address()));
};
