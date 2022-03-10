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
export const funcREQ = (apps) => {
  apps.get('/', (req, res) => res.sendStatus(200));
};
