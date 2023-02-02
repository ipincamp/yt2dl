import crypto from 'crypto'
import sqlite3, { type Database } from 'sqlite3'

interface Env {
  host: string
  port: number
  regx: RegExp
}

interface Format {
  mid: string
  exp: number
  txt: string
}

export class SQLite {
  protected db: Database

  constructor() {
    this.db = new sqlite3.Database('yt2dl.db', (err) => {
      if (err) {
        throw new Error(err.message)
      } else {
        console.info("connect to database and successfully create 'ytdl' table!")
      }
    })
    this.init()
  }

  private init(): void {
    this.db.run(`
CREATE TABLE IF NOT EXISTS ytdl (
  mid CHAR(20) UNIQUE NOT NULL,
  exp INT NOT NULL,
  txt VARCHAR NOT NULL
)
    `)
  }

  /**
   * check
   */
  public async check(mid: string): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM ytdl WHERE mid = "${mid}"`, (err, row) => {
        if (err) {
          reject(err.message)
        } else {
          if (row.length === 0) {
            resolve(false)
          } else {
            resolve(true)
          }
        }
      })
    })
  }

  /**
   * create
   */
  public async create(column: string[], data: [string, number, string]): Promise<void> {
    await new Promise((resolve, reject) => {
      const col = column.map((v) => v).join(', ')
      this.db.run(`INSERT OR REPLACE INTO ytdl (${col}) VALUES (?, ?, ?)`, data, (err) => {
        if (err) {
          reject(err.message)
        } else {
          resolve(undefined)
        }
      })
    })
  }

  /**
   * read
   */
  public async read(mid: string): Promise<Format> {
    return await new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM ytdl WHERE mid = "${mid}"`, (err, row) => {
        if (err) {
          reject(err.message)
        } else {
          resolve(row)
        }
      })
    })
  }

  /**
   * update
   */
  public async update(mid: string, exp: number, txt: string): Promise<void> {
    await new Promise((resolve, reject) => {
      this.db.run(`UPDATE ytdl SET exp = ${exp}, txt = "${txt}" WHERE mid = "${mid}"`, (err) => {
        if (err) {
          reject(err.message)
        } else {
          resolve(undefined)
        }
      })
    })
  }

  /**
   * delet
   */
  public async delet(mid: string): Promise<void> {
    await new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM ytdl WHERE mid = "${mid}"`, (err) => {
        if (err) {
          reject(err.message)
        } else {
          resolve(undefined)
        }
      })
    })
  }
}

export class Utils {
  protected host: string
  protected port: number
  protected regx: RegExp
  protected algo = 'aes-128-ctr'
  protected key = 'ytdlNodeJS2023v1'

  constructor() {
    this.host = process.env.HOST ? process.env.HOST : 'http://localhost:8000'
    this.port = process.env.PORT ? parseInt(process.env.PORT) : 8000
    this.regx =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
  }

  public get env(): Env {
    return {
      host: this.host,
      port: this.port,
      regx: this.regx
    }
  }

  /**
   * encrypt
   */
  public encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algo, this.key, iv)
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
    return `${iv.toString('hex')}${encrypted.toString('hex')}`
  }

  /**
   * decrypt
   */
  public decrypt(hash: string): string {
    try {
      const iv = hash.slice(0, 32)
      const dt = hash.slice(32)
      const decipher = crypto.createDecipheriv(this.algo, this.key, Buffer.from(iv, 'hex'))
      const decrypted = Buffer.concat([decipher.update(Buffer.from(dt, 'hex')), decipher.final()])
      return decrypted.toString()
    } catch {
      return ''
    }
  }

  /**
   * toHMS
   */
  public toHMS(second: number): string {
    const hours = Math.floor(second / 3600)
    const minutes = Math.floor(second / 60) % 60
    const seconds = second % 60
    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? `0${v}` : v))
      .filter((v, i) => v !== '00' || i > 0)
      .join(':')
  }

  /**
   * cekexp
   */
  public cekexp(time: number): boolean {
    return time < Date.now()
  }

  /**
   * setexp
   */
  public setexp(time: number = 24): number {
    return new Date(Date.now() + 1000 * 60 * 60 * time).getTime()
  }
}
