/**
 * @name fetchAPI
 * @description A function to check an active website.
 * @author ipincamp <support@nur-arifin.my.id>
 * @license MIT (MIT License)
 */

/**
 * Usage
 *
 * const { fetchAPI } = require('./fetchAPI');
 *
 * const url = 'https://example.com/'; Can be array or single string
 *
 * setInterval(() => {
 *   fetchAPI(url);
 * }, 299000); Interval in miliseconds
 *
 */

const fetch = require('node-fetch');
const { isTypedArray } = require('lodash');

// eslint-disable-next-line consistent-return
const urlCheck = (res) => {
  try {
    if (res.ok) return res;
  } catch (error) {
    console.error(error);
  }
};

module.exports.fetchAPI = async function trigger(url) {
  if (url === isTypedArray) {
    for (let x = 0; x < url.length; x++) {
      let urI = url[x];
      // eslint-disable-next-line no-await-in-loop
      let res = await fetch(urI);

      try {
        urlCheck(res);
        /**
         * If you want to enable logging:
         *
         * console.info(`Response ${res.status}(${res.statusText}) for ${res.url}`);
         */
      } catch (err) {
        console.error(err);
      }
    }
  }
  let res = await fetch(url);

  try {
    urlCheck(res);
  } catch (err) {
    console.error(err);
  }
};
