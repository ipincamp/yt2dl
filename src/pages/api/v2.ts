import type { NextApiRequest, NextApiResponse } from "next";
import { validateURL } from "ytdl-core";
import axios from "axios";
import { encrypt } from "@/utils/crypto";
import { toTime } from "@/utils/dateTime";
import apiValidation from "@/utils/apiValidation";
import config from "@/utils/config";
import handleCors from "@/utils/cors";
import resJson from "@/utils/resJson";

async function fetchApi(url: string) {
  const { data } = await axios({
    method: "POST",
    headers: {
      "Content-Type": config.ct,
      Origin: "https://www.y2mate.com",
      Referer: "https://www.y2mate.com/",
      "User-Agent": config.ua,
    },
    url: "https://www.y2mate.com/mates/analyzeV2/ajax",
    data: `k_query=${encodeURIComponent(url)}&k_page=home&hl=en&q_auto=1`,
  });

  return data;
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

      const data = await fetchApi(value.url);

      if (!(data.status === "ok" && data.mess.length === 0)) {
        resJson(404, "not found", [], res);
        return;
      }

      const formats = [];

      for (const ext of ["mp3", "mp4"]) {
        if (!data.links[ext]) continue;

        for (const format of Object.values(data.links[ext])) {
          const { f, q, k } = format as { f: string; q: string; k: string };

          if (!["mp3", "mp4"].includes(f) || q === "auto") continue;

          const quality = q.includes("k")
            ? `${parseInt(q, 10)}k (${f})`
            : `${q} (${f})`;
          const token = encrypt(
            JSON.stringify({
              v: 2,
              t: `${data.title} [${quality.split(" ")[0]}]`,
              u: `vid=${data.vid}&k=${encodeURIComponent(k)}`,
            })
          );

          formats.push({
            q: quality,
            t: token,
          });
        }
      }

      const result = {
        title: data.title,
        thumbnail: `https://i.ytimg.com/vi/${data.vid}/maxresdefault.jpg`,
        channel: data.a,
        duration: toTime(+data.t),
        formats: formats.sort((a, b) => parseInt(a.q, 10) - parseInt(b.q, 10)),
      };

      resJson(200, "success", result, res);
    }

    resJson(405, "Not found", [], res);
  } catch (unknownErrors: any) {
    resJson(500, unknownErrors?.message ?? "unknown errors", [], res);
  }
}
