/*
Generates app icons and Play Store assets from a single 1024x1024 source image using sharp.
Usage:
  node scripts/generate-assets.js --src ./assets/source/icon-1024.png --out ./assets/generated
Requires: npm i --save-dev sharp
*/

const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  const srcIdx = args.indexOf('--src');
  const outIdx = args.indexOf('--out');
  const src = srcIdx !== -1 ? args[srcIdx + 1] : './assets/source/icon-1024.png';
  const out = outIdx !== -1 ? args[outIdx + 1] : './assets/generated';

  // lazy load sharp (optional dependency)
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Error: sharp not installed. Run: npm i --save-dev sharp');
    process.exit(1);
  }

  if (!fs.existsSync(src)) {
    console.warn(`Source not found: ${src}. Creating a placeholder icon...`);
    const placeholderDir = path.dirname(src);
    fs.mkdirSync(placeholderDir, { recursive: true });
    const placeholder = await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 20, g: 24, b: 28, alpha: 1 }
      }
    })
      .composite([
        // simple Kaaba-like square
        { input: await sharp({ create: { width: 520, height: 520, channels: 4, background: { r: 12, g: 12, b: 12, alpha: 1 } } }).png().toBuffer(), left: 252, top: 252 },
        // door/gold stripe
        { input: await sharp({ create: { width: 520, height: 28, channels: 4, background: { r: 196, g: 164, b: 84, alpha: 1 } } }).png().toBuffer(), left: 252, top: 320 }
      ])
      .png()
      .toBuffer();
    await fs.promises.writeFile(src, placeholder);
    console.log('Placeholder icon written to', src);
  }
  fs.mkdirSync(out, { recursive: true });

  const write = async (bufferPromise, relPath) => {
    const full = path.join(out, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    const buffer = await bufferPromise;
    await fs.promises.writeFile(full, buffer);
    console.log('Wrote', relPath);
  };

  // Base
  const base = sharp(src).resize(1024, 1024, { fit: 'cover' });

  // Play Store high-res icon 512x512
  await write(base.resize(512, 512).png().toBuffer(), 'store/icon-512.png');

  // Feature graphic 1024x500 (center crop)
  // Feature graphic 1024x500 (centered icon scaled down to fit)
  const featureBg = await sharp({
    create: {
      width: 1024,
      height: 500,
      channels: 4,
      background: { r: 20, g: 24, b: 28, alpha: 1 }
    }
  }).png().toBuffer();
  const featureIcon = await base.resize(420, 420).png().toBuffer();
  const feature = await sharp(featureBg)
    .composite([{ input: featureIcon, top: 40, left: (1024 - 420) / 2 }])
    .png()
    .toBuffer();
  await write(Promise.resolve(feature), 'store/feature-1024x500.png');

  // Android mipmap sizes
  const mipmaps = [
    { name: 'mdpi', size: 48 },
    { name: 'hdpi', size: 72 },
    { name: 'xhdpi', size: 96 },
    { name: 'xxhdpi', size: 144 },
    { name: 'xxxhdpi', size: 192 }
  ];
  for (const m of mipmaps) {
    await write(base.resize(m.size, m.size).png().toBuffer(), `android/mipmap-${m.name}/ic_launcher.png`);
  }

  // Adaptive icon: foreground (transparent padding) and background color
  const fg = await base.resize(432, 432).png().toBuffer();
  await write(Promise.resolve(fg), 'android/adaptive/foreground.png');
  // Background solid color tile 108x108 (Android adaptive background reference size)
  const bg = await sharp({
    create: { width: 108, height: 108, channels: 4, background: { r: 14, g: 94, b: 180, alpha: 1 } }
  }).png().toBuffer();
  await write(Promise.resolve(bg), 'android/adaptive/background.png');

  console.log('All assets generated in', out);
}

main().catch(err => { console.error(err); process.exit(1); });
