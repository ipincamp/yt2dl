/**
 * @name yt2dl
 * @version 1.0.9
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

const resJson = require('../utils/resJson');

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
module.exports = async (req, res) => {
  resJson(res, 404, 'not found');
};
