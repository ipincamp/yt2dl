/**
 * @name yt2dl
 * @version 1.0.9
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

/**
 *
 * @param {import('express').Response} res
 * @param {number} code
 * @param {string} message
 * @param {any} data
 * @returns {void}
 */
module.exports = (res, code, message, data = []) => {
  res.status(code).json({
    status: code < 400,
    statusCode: code,
    message,
    data,
  });
};
