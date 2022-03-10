/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

import express from 'express';
import { funcREQ } from './src/events/req.js';
import { funcAPI } from './src/events/api.js';
import { funcGET } from './src/events/get.js';

const apps = express();
const port = process.env.PORT || 8000;

apps.use(express.static('./src/public'));

funcREQ(apps);
funcAPI(apps);
funcGET(apps);

apps.listen(port, () => console.info(`Listening server at port ${port}`));
