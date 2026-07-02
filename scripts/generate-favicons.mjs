import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'favicon.svg');
const svg = fs.readFileSync(svgPath);

const pngSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-512.png', size: 512 },
];

const pngBuffers = [];

for (const { name, size } of pngSizes) {
  const buffer = await sharp(svg)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, name), buffer);
  if (size <= 48) {
    pngBuffers.push(buffer);
  }
}

const icoBuffer = await toIco(pngBuffers);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

console.log('Generated favicon assets:', pngSizes.map((item) => item.name).join(', '), 'favicon.ico');
