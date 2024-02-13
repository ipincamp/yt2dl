/**
 * @name yt2dl
 * @version 1.0.9
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

const { createCipheriv, randomBytes } = require('crypto');

/**
 *
 * @param {string} jsonStringify
 * @returns
 */
module.exports = (jsonStringify) => {
  const key = randomBytes(32);
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let raw = cipher.update(jsonStringify);
  raw = Buffer.concat([raw, cipher.final()]);

  return `${iv.toString('hex')}.${raw.toString('hex')}.${key.toString('hex')}`;
};
