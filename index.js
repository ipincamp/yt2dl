/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const express = require('express');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.static('./src/public'));

require('./src/events/root')(app);
require('./src/events/api')(app);
require('./src/events/convert')(app);

app.listen(port, () => console.info(`Listening server at port ${port}`));
