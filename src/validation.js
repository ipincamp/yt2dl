/**
 * @name yt2dl
 * @version v1.0.8
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

const Joi = require('joi');

const apiSchema = Joi.object({
  url: Joi.string().required()
});

const dlSchema = Joi.object({
  t: Joi.string().required()
});

module.exports = {
  apiSchema,
  dlSchema
};
