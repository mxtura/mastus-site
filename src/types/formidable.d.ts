declare module 'formidable' {
  import type { IncomingMessage } from 'http'

  export interface File {
    filepath: string
    originalFilename?: string | null
    mimetype?: string | null
    size: number
  }

  export interface Fields {
    [key: string]: undefined | string | string[]
  }

  export interface Files {
    [key: string]: undefined | File | File[]
  }

  export interface Errors extends Error {
    httpCode?: number
    statusCode?: number
  }

  export interface Options {
    multiples?: boolean
    maxFiles?: number
    maxFileSize?: number
    maxTotalFileSize?: number
    allowEmptyFiles?: boolean
  }

  export interface IncomingForm {
    parse(
      req: IncomingMessage,
      callback: (err: Errors | undefined, fields: Fields, files: Files) => void,
    ): void
  }

  function formidable(options?: Options): IncomingForm

  export type FormidableFile = File
  export { Fields, Files, Errors }
  export default formidable
}
