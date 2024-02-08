import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

const cors = Cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: "*",
});

export default function handleCors(_req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve, reject) => {
    cors(_req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}
