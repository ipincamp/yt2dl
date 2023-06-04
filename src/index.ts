/**
 * @name yt2dl
 * @version v1.0.7
 * @license GPL-3.0
 */

import express, { type Application, type NextFunction, type Request, type Response } from 'express'
import expressValidation from 'express-validation'

const app: Application = express()
const { Joi, validate } = expressValidation

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.get('/', (req: Request, res: Response, next: NextFunction): void => {
  res.sendStatus(200)
})

/** Example video url:
 * https://www.youtube.com/watch?v=iVsS3BlJ47k
 */
app.post(
  '/api',
  validate({
    body: Joi.object({
      id: Joi.string().min(11).required()
    })
  }),
  (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.body
    res.status(200).json({
      status: true,
      statusCode: 200,
      result: [id]
    })
  }
)

app.listen(8000, () => {
  console.info('Listening Server on Port 8000')
})
