/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

import { Router } from 'express';
import videoInfoHandler from '../handler/video_info.js';
import downloadHandler from '../handler/download.js';

const router = Router();

/**
 * GET /api/video-info
 * Fetches YouTube video information
 * Query params: url (YouTube video URL)
 */
router.get('/video-info', videoInfoHandler);

/**
 * POST /api/download
 * Downloads the selected video/audio format
 * Body: { url: string, token: string }
 */
router.post('/download', downloadHandler);

export default router;
