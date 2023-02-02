export interface Cdn {
  mid: string
  exp: number
  txt: string
}

export type Format = Array<{
  label: string
  token: string
}>
