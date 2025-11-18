/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

import { Innertube, UniversalCache } from 'youtubei.js';

/**
 * Initializes and exports an instance of the Innertube API client.
 *
 * @remarks
 * This instance is configured with a universal cache, a custom user agent string,
 * and a specific timezone ("Asia/Jakarta").
 *
 * @example
 * ```typescript
 * import ytCore from './core/yt_core';
 * // Use ytCore to interact with YouTube's internal API.
 * ```
 *
 * @see {@link Innertube.create}
 *
 * @returns {Promise<Innertube>} A promise that resolves to an initialized Innertube client.
 */
export default await Innertube.create({
  cache: new UniversalCache(true),
  user_agent:
    'Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0',
  timezone: 'Asia/Jakarta',
});
