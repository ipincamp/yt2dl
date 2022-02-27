/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

/**
 *
 * @param {import('express').Application} app
 */
module.exports = function (app) {
  app.get('/', (req, res) => res.sendStatus(200));
};
