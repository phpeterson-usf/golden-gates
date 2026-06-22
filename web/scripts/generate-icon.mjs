// Generate a high-resolution PNG app icon from the committed SVG.
//
// electron-builder uses assets/icon.icns for macOS, but the Windows build
// needs a raster icon; given a >=256px PNG it auto-converts to .ico. We
// generate the PNG from assets/icon.svg (instead of committing a binary) so
// the icon always tracks the source SVG.
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const src = resolve(here, '../assets/icon.svg')
const out = resolve(here, '../assets/icon.png')

await sharp(src, { density: 384 })
  .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(out)

console.log(`Wrote ${out}`)
