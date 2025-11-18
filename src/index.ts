import { Innertube, UniversalCache } from 'youtubei.js';

const yt = await Innertube.create({
  cache: new UniversalCache(true),
  user_agent:
    'Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0',
  timezone: 'Asia/Jakarta',
});

async function getVideoInfo(videoId: string) {
  const videoInfo = await yt.actions.execute('/player', {
    // You can add any additional payloads here, and they'll merge with the default payload sent to InnerTube.
    videoId,
    client: 'YTMUSIC', // InnerTube client to use.
    parse: true, // tells YouTube.js to parse the response (not sent to InnerTube).
  });

  return videoInfo;
}

// https://www.youtube.com/shorts/XJRH0rT87W0
const videoInfo = await getVideoInfo('XJRH0rT87W0');
console.info(videoInfo);
