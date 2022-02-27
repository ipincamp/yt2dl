/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const express = require('express');
const { fetchAPI } = require('./src/fetchAPI');

const app = express();
const port = process.env.PORT || 8000;
const url = 'https://y2m.herokuapp.com/';

app.use(express.static('./src/public'));

setInterval(() => {
  fetchAPI(url);
}, 299000);

require('./src/events/root')(app);
require('./src/events/api')(app);
require('./src/events/convert')(app);

app.listen(port, () => console.info(`Listening server at port ${port}`));
