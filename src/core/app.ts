/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

import express, { Request, Response, NextFunction } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import apiRouter from '../router/api.js';

const app = express();

/**
 * Middleware for parsing JSON request bodies
 */
app.use(express.json());

/**
 * Static file serving
 * Serves static files from the 'public' directory.
 * Example: /public/logo.png will be accessible at /logo.png
 */
app.use(express.static('public'));

/**
 * API routes
 * All API endpoints are prefixed with /api
 */
app.use('/api', apiRouter);

/**
 * Root route handler
 * Responds with the user's User-Agent header.
 */
app.get('/', (req: Request, res: Response) => {
  const userAgent = req.headers['user-agent'];
  res.send({
    status: true,
    message: 'OK',
    data: { userAgent },
  });
});

/**
 * 404 handler
 * Passes a 404 error to the error handler if no route matches.
 */
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createHttpError(404));
});

/**
 * Global error handler
 * Handles all errors and sends a formatted response.
 */
app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') !== 'production' ? err : {};

  res.status(err.status || 500).send({
    status: false,
    message: err.message,
    data: res.locals.error,
  });
});

export default app;
