import type { NextApiResponse } from "next";
import type { IResJson } from "@/interfaces";

export default function resJson<T>(
  code: number,
  message: string,
  data: T,
  res: NextApiResponse<IResJson<T>>
) {
  res.status(code).json({
    status: code < 400,
    statusCode: code,
    message,
    data,
  });
}
