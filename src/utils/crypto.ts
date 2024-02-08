import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const algorithm = "aes-256-cbc";

function encrypt(strJson: string) {
  const key = randomBytes(32);
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, Buffer.from(key), iv);
  let raw = cipher.update(strJson);
  raw = Buffer.concat([raw, cipher.final()]);

  return `${iv.toString("hex")}.${raw.toString("hex")}.${key.toString("hex")}`;
}

function decrypt(strEncrypted: string) {
  if (strEncrypted.match(/\./g)?.length !== 2) {
    return {
      valid: false,
      result: "invalid token (format).",
    };
  }

  const enc = strEncrypted.split(".");

  if (enc[0].length !== 32) {
    return {
      valid: false,
      result: "invalid token (iv).",
    };
  }

  if (enc[2].length !== 64) {
    return {
      valid: false,
      result: "invalid token (key).",
    };
  }

  const iv = Buffer.from(enc[0], "hex");
  const raw = Buffer.from(enc[1], "hex");
  const key = Buffer.from(enc[2], "hex");

  try {
    const decipher = createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(raw);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return {
      valid: true,
      result: decrypted.toString(),
    };
  } catch {
    return {
      valid: false,
      result: "invalid token (process)",
    };
  }
}

export { encrypt, decrypt };
