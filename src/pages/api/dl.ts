import type { NextApiRequest, NextApiResponse } from "next";
import Joi from "joi";
import axios from "axios";
import sanitize from "sanitize-filename";
import { decrypt } from "@/utils/crypto";
import resJson from "@/utils/resJson";
import config from "@/utils/config";
import handleCors from "@/utils/cors";

function dlValidation(input: any) {
  const schema = Joi.object<{ t: string }>({
    t: Joi.string()
      .required()
      .regex(/^[a-f0-9]{32}\.[^.]*\.[a-f0-9]{64}$/),
  });

  return schema.validate(input);
}

async function stream(
  url: string,
  contentType: string,
  filename: string,
  res: NextApiResponse
) {
  const { data, headers } = await axios({
    httpsAgent: config.ha,
    method: "GET",
    responseType: "stream",
    url,
  });

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", headers["content-length"]);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${filename}; filename*=utf-8''${filename}`
  );

  data.pipe(res);
}

async function fetchApi(token: string) {
  const { data } = await axios({
    method: "POST",
    headers: {
      "Content-Type": config.ct,
      Origin: "https://www.y2mate.com",
      Referer: "https://www.y2mate.com/",
      "User-Agent": config.ua,
    },
    url: "https://www.y2mate.com/mates/convertV2/index",
    data: token,
  });

  return data;
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await handleCors(_req, res);
  try {
    if (_req.method && _req.method === "GET") {
      const { error, value } = dlValidation(_req.query);

      if (error) {
        resJson(400, error.details[0].message.replace(/"/g, "'"), [], res);
        return;
      }

      const token = decrypt(value.t);

      if (!token.valid) {
        resJson(422, token.result, [], res);
        return;
      }

      const tokenJson = JSON.parse(token.result) as {
        t: string;
        u: string;
        v: number;
      };
      const { t: title, u: field, v: apiVersion } = tokenJson;

      const ext = title.slice(-2, -1) === "k" ? "mp3" : "mp4";
      const contentType = ext === "mp3" ? "audio/mpeg" : "video/mp4";
      const filename = encodeURI(sanitize(title)) + "." + ext;

      if (apiVersion === 1) {
        stream(field, contentType, filename, res);
        return;
      }

      if (apiVersion === 2) {
        // const data = await fetchApi(field);

        // if (data.c_status !== "CONVERTED" && data.mess.length > 0) {
        //   resJson(503, "please try again", [], res);
        //   return;
        // }

        // stream(data.dlink, contentType, filename, res);
        return;
      }

      resJson(501, "not implemented", [], res);
    }

    resJson(405, "not found", [], res);
  } catch (unknownErrors: any) {
    resJson(500, unknownErrors?.message ?? "unknown errors", [], res);
  }
}
