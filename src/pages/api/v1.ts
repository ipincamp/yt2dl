import type { NextApiRequest, NextApiResponse } from "next";
import { getInfo, validateURL, type videoFormat } from "ytdl-core";
import { encrypt } from "@/utils/crypto";
import { toDate, toTime } from "@/utils/dateTime";
import apiValidation from "@/utils/apiValidation";
import handleCors from "@/utils/cors";
import resJson from "@/utils/resJson";

function filterFormat(format: videoFormat) {
  return (
    format.mimeType?.includes("audio/mp4") ||
    (format.hasAudio && format.hasVideo)
  );
}

function mapFormat(format: videoFormat, title: string) {
  const { height, audioBitrate, url } = format;
  const quality = height ? `${height}p (mp4)` : `${audioBitrate}k (mp3)`;
  const tokenJson = JSON.stringify({
    v: 1,
    t: `${title} [${quality.slice(0, -6)}]`,
    u: url,
  });

  return {
    q: quality,
    t: encrypt(tokenJson),
  };
}

async function fetchApi(url: string) {
  const { formats, videoDetails } = await getInfo(url);
  const { lengthSeconds, ownerChannelName, publishDate, thumbnails, title } =
    videoDetails;
  const thumbnail = thumbnails.pop()?.url;
  const result = {
    title,
    thumbnail,
    channel: ownerChannelName,
    duration: toTime(+lengthSeconds),
    published: toDate(publishDate),
    formats: formats
      .filter(filterFormat)
      .map((format) => mapFormat(format, title)),
  };

  return result;
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await handleCors(_req, res);
  try {
    if (_req.method && _req.method === "POST") {
      const { error, value } = apiValidation(_req.body);

      if (error) {
        resJson(400, error.details[0].message.replace(/"/g, "'"), [], res);
        return;
      }

      if (!validateURL(value.url)) {
        resJson(422, "invalid url", [], res);
        return;
      }

      const result = await fetchApi(value.url);

      resJson(200, "success", result, res);
    }

    resJson(405, "Not found", [], res);
  } catch (unknownErrors: any) {
    resJson(500, unknownErrors?.message ?? "unknown errors", [], res);
  }
}
