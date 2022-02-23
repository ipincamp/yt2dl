/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const express = require('express');
const { join } = require('path');
const { readdirSync } = require('fs');
const { fetchAPI } = require('./src/fetchAPI');

const app = express();
const port = process.env.PORT || Math.floor(Math.random() * (50000 - 10000 + 1)) + 10000;
const url = 'https://y2m.herokuapp.com/';

app.use(express.static('public'));

setInterval(() => {
  fetchAPI(url);
}, 299000);

const eventFiles = readdirSync(join(__dirname, './src/events'))
  .filter((x) => x.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(join(__dirname, './src/events', `${file}`));

  app.get(event.name, (...args) => event.run(...args));
}

app.listen(port, () => console.info(`Listening server at port ${port}`));
