/**
 * @name yt2dl
 * @version v1.0.8
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

const express = require('express');
const { json, urlencoded } = require('body-parser');
const download = require('./src/download');
const v1 = require('./src/api/v1');
const v2 = require('./src/api/v2');

const app = express();
const port = process.env.PORT ?? 8000;

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/api/v1', v1);
app.post('/api/v2', v2);
app.get('/dl', download);

app.listen(+port, () => {
  console.info('dah tuh');
});
