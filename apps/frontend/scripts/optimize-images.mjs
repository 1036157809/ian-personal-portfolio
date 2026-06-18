import sharp from 'sharp'
import { readdirSync, existsSync, unlinkSync, statSync } from 'fs'
import { join, basename, extname, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSETS = join(__dirname, '..', 'src', 'assets', 'images')

const tasks = [
  { dir: join(ASSETS, 'pc'),        w: 800,  h: 600  },
  { dir: join(ASSETS, 'mobile'),    w: 600,  h: 1024 },
  { dir: join(ASSETS, 'players'),   w: 128,  h: 128  },
  { dir: join(ASSETS, 'wallpapers'), w: 1920, h: 1080 },
  { dir: join(ASSETS, 'map'),       w: 648,  h: 600  },
]

let totalBefore = 0, totalAfter = 0, count = 0

for (const { dir, w, h } of tasks) {
  if (!existsSync(dir)) continue

  const files = readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f))
  for (const file of files) {
    const input = join(dir, file)
    const name = basename(file, extname(file))
    const output = join(dir, name + '.webp')

    const before = statSync(input).size

    await sharp(input)
      .resize(w, h, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(output)

    const after = statSync(output).size
    totalBefore += before
    totalAfter += after
    count++

    if (input !== output) unlinkSync(input)

    console.log(`✓ ${basename(dir)}/${file}  ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB  (${Math.round(after/before*100)}%)`)
  }
}

console.log(`\n✅ ${count} files  ${(totalBefore/1024/1024).toFixed(1)}MB → ${(totalAfter/1024/1024).toFixed(1)}MB  (${Math.round(totalAfter/totalBefore*100)}%)`)
