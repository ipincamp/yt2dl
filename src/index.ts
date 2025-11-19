/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

import app from './core/app.js';
import http from 'http';
import { normalize_port } from './util/normalize_port.js';
import listener from './event/listener.js';

async function main() {
  const port = normalize_port(process.env.PORT || '3000');
  const express = app;
  express.set('port', port);

  const server = http.createServer(express);
  server.listen(port);
  listener(server);
}
main();
