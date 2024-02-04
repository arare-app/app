import { app, net, protocol } from 'electron'

import { existsSync } from 'node:fs'
import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const RESOURCES_DIR = path.resolve(app.getAppPath(), 'resources')
const RESOURCES_REGEX = /^https:\/\/www\.bondageprojects\.elementfx\.com\/R\d+\/BondageClub\/(Assets|Audio|Backgrounds|Fonts|Icons)\/(.*)$/

export function createProxy() {
  protocol.handle('https', async (req: Request) => {
    const m = RESOURCES_REGEX.exec(req.url)
    if (m) {
      if (typeof m[1] === 'string') {
        const urlpath = m[2]
        const file = path.resolve(RESOURCES_DIR, m[1], urlpath)
        if (existsSync(file)) {
          const mimeType = (await (await import('file-type')).fileTypeFromFile(file))?.mime ?? 'application/octet-stream'
          const response = new Response(await readFile(file))
          response.headers.set('Content-Type', mimeType)
          response.headers.set('Access-Control-Allow-Origin', '*')
          response.headers.set('Access-Control-Allow-Methods', 'GET')
          response.headers.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
          response.headers.set('Access-Control-Allow-Credentials', 'true')
          response.headers.set('Access-Control-Max-Age', '1800')

          return response
        } else {
          // if file is not exist, we get the image file and save it locally
          const response = await net.fetch(req, { bypassCustomProtocolHandlers: true })
          if (response.ok) {
            const buffer = await response.arrayBuffer()
            if (!existsSync(path.dirname(file))) {
              await mkdir(path.dirname(file), { recursive: true })
            }
            await writeFile(file, Buffer.from(buffer))
            // Because we have already read the data from the response,
            // this will turn the response into a locked state. So we
            // need to create a new response object to return.
            // Ref: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/locked
            const newResponse = new Response(Buffer.from(buffer))
            response.headers.forEach((value, key) => {
              newResponse.headers.set(key, value)
            })
            return newResponse
          } else {
            return response
          }
        }
      }
    }
    // bypassCustomProtocolHandlers makes the current request bypass this handler
    // so it would access the correct address.
    return net.fetch(req, { bypassCustomProtocolHandlers: true })
  })
}
