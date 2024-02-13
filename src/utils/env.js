/**
 * @name yt2dl
 * @version 1.0.9
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

require('dotenv').config();

const { HOST, PORT } = process.env;

module.exports = {
  host: HOST && HOST !== '' ? HOST : 'http://localhost:8000',
  port: PORT && PORT !== '' ? +PORT : 8000,
  contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
};
