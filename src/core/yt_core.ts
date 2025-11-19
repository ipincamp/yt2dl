/**
 * @name yt2dl
 * @version 2.0.0
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GPL-3.0 (General Public License v3.0)
 */

import { Innertube, Platform, Types, UniversalCache } from 'youtubei.js/web';

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
 */
export default await Innertube.create({
  cache: new UniversalCache(true),
  retrieve_player: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers: Record<string, string> = {
      ...(init?.headers || {}),
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: '*/*',
    };

    return globalThis.fetch(input, {
      ...init,
      headers,
    });
  },
});
