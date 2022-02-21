/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const cp = require('child_process');
const ytpl = require('ytpl');
const { validate, Joi } = require('express-validation');

module.exports = {
  name: '/cvlist',
  async run(req, res, next) {
    validate({
      query: Joi.object({
        id: Joi.string().required(),
      }),
    });

    const { id } = req.query;

    const plID = (await ytpl(id)).id;
    const pathID = `./src/playlists/${plID}`;

    try {
      cp.execSync(`zip -r ${plID}.zip ./* && rm *.mp3`, {
        cwd: pathID,
      });

      res.download(`${pathID}/${plID}.zip`);
    } catch (err) {
      next(err);
    }
  },
};
