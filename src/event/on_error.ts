/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

/**
 * Handles server listen errors and exits the process with a friendly message for specific error codes.
 * @param error - The error object thrown by the server.
 * @param port - The port or pipe the server is attempting to listen on.
 */
export default function onError(
  // eslint-disable-next-line no-undef
  error: NodeJS.ErrnoException,
  port: string | number
): void {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}
