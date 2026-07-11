// One-off dev tool: generates placeholder PWA icons (solid bowl glyph) as real PNGs,
// without adding a canvas/image dependency to the project.
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function encodePNG(width, height, pixels /* RGBA Uint8Array */) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    pixels.subarray(y * stride, y * stride + stride).forEach((v, i) => {
      raw[y * (stride + 1) + 1 + i] = v
    })
  }
  const idat = deflateSync(raw)

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function drawIcon(size, { padding = 0 } = {}) {
  const pixels = new Uint8Array(size * size * 4)
  const bg = hexToRgb('#15803d') // green
  const bowl = hexToRgb('#ffffff')
  const food = hexToRgb('#f97316') // orange

  const cx = size / 2
  const cy = size / 2
  const safe = (size - padding * 2) / 2

  const bowlR = safe * 0.62
  const foodR = safe * 0.34
  const foodCy = cy - safe * 0.06

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      let r = bg[0], g = bg[1], b = bg[2], a = 255

      const dxBowl = x - cx
      const dyBowl = y - (cy + safe * 0.08)
      const distBowl = Math.sqrt(dxBowl * dxBowl + dyBowl * dyBowl)

      const dxFood = x - cx
      const dyFood = y - foodCy
      const distFood = Math.sqrt(dxFood * dxFood + dyFood * dyFood)

      if (distBowl < bowlR) {
        r = bowl[0]; g = bowl[1]; b = bowl[2]
      }
      if (distFood < foodR) {
        r = food[0]; g = food[1]; b = food[2]
      }

      pixels[i] = r
      pixels[i + 1] = g
      pixels[i + 2] = b
      pixels[i + 3] = a
    }
  }
  return pixels
}

function writeIcon(path, size, opts) {
  const pixels = drawIcon(size, opts)
  const png = encodePNG(size, size, pixels)
  writeFileSync(path, png)
  console.log('wrote', path, `${size}x${size}`)
}

writeIcon('public/pwa-192x192.png', 192, {})
writeIcon('public/pwa-512x512.png', 512, {})
// Maskable: keep visual content within the safe zone (inner ~80%)
writeIcon('public/maskable-icon-512x512.png', 512, { padding: 512 * 0.1 })
writeIcon('public/apple-touch-icon.png', 180, { padding: 180 * 0.06 })
