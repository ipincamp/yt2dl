import { Agent } from "https";

const config = {
  host: process.env.HOST ?? 'http://localhost:3000/api',
  ct: "application/x-www-form-urlencoded; charset=UTF-8",
  ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
  ha: new Agent({ rejectUnauthorized: false })
};

export default config;
