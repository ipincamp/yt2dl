import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";

const cors = Cors({
  origin: "*",
  methods: ["GET", "POST"],
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
