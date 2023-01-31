/**
 * @name yt2dl
 * @version v1.0.6
 * @license GPL-3.0
 */

import express, { type Application, type NextFunction, type Request, type Response } from 'express'

const app: Application = express()
const host: string = process.env.HOST !== undefined ? process.env.HOST : 'http://localhost:8000'
const port: number = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 8000

app.all('/', (req: Request, res: Response, next: NextFunction) => res.sendStatus(200))

app.listen(port, () => {
  console.info(host)
})
