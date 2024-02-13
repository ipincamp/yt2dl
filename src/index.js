/**
 * @name yt2dl
 * @version 1.0.9
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

const { json, urlencoded } = require('body-parser');
const express = require('express');
const cors = require('cors');
const { port } = require('./utils/env');
const apiV1 = require('./controllers/apiV1');
const apiV2 = require('./controllers/apiV2');
const notFound = require('./controllers/notFound');

const app = express();

/** body-parser */
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(express.static('public'));

/** cors */
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  next();
});

/** routes */
app.post('/api/v1', apiV1);
app.post('/api/v2', apiV2);
app.use('*', notFound);

/** start express application */
app.listen(port);
