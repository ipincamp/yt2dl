/**
 * @name yt2dl
 * @version 1.0.9
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

const Joi = require('joi');

/**
 *
 * @param {any} input
 * @returns {Joi.ValidationResult<{ url: string}>}
 */
module.exports = (input) => {
  const schema = Joi.object({
    url: Joi.string().required(),
  });

  return schema.validate(input);
};
