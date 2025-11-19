/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

import { Innertube, UniversalCache, Platform, type Types } from 'youtubei.js';

/**
 * Configure Platform.shim.eval to handle URL deciphering
 * This is required for deciphering streaming URLs in Node.js environment
 */
Platform.shim.eval = async (
  data: Types.BuildScriptResult,
  env: Record<string, Types.VMPrimative>
) => {
  const properties = [];

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`);
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
  }

  const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

  return new Function(code)();
};

/**
 * Initializes and exports an instance of the Innertube API client.
 *
 * @remarks
 * This instance is configured with a universal cache, a custom user agent string,
 * a specific timezone ("Asia/Jakarta"), and Platform.shim.eval for URL deciphering.
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
