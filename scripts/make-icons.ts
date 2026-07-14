// One-off icon generator: renders the Impostoor bean into the PNG set the
// manifest references. Run with: bun run scripts/make-icons.ts
import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const bean = `
  <path d="M256 92c-72 0-122 52-122 124v136c0 24 19 44 43 44h13v-34c0-11 9-20 20-20s20 9 20 20v34h52v-34c0-11 9-20 20-20s20 9 20 20v34h13c24 0 43-20 43-44V216c0-72-50-124-122-124z" fill="#ff5a5f"/>
  <rect x="208" y="176" width="152" height="70" rx="35" fill="#f4ede3"/>
  <rect x="222" y="190" width="60" height="24" rx="12" fill="#c9ecff" opacity="0.85"/>`

// Full-bleed square; iOS/maskable masks apply their own corner rounding.
const square = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#14101d"/>${bean}
</svg>`

// Maskable: artwork scaled into the ~80% safe zone.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#14101d"/>
  <g transform="translate(51.2 51.2) scale(0.8)">${bean}</g>
</svg>`

const favicon = readFileSync('public/favicon.svg')

await sharp(favicon).resize(192, 192).png().toFile('public/pwa-192.png')
await sharp(favicon).resize(512, 512).png().toFile('public/pwa-512.png')
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile('public/pwa-maskable-512.png')
await sharp(Buffer.from(square)).resize(180, 180).png().toFile('public/apple-touch-icon.png')

console.log('icons written')
