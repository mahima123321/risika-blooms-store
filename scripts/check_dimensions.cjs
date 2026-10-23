const fs = require('fs');
const path = require('path');

function getJpegSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xFF) break;
    const marker = buffer[offset + 1];
    if (marker === 0xC0 || marker === 0xC2) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }
    const len = buffer.readUInt16BE(offset + 2);
    offset += 2 + len;
  }
  return null;
}

const dir = path.join(__dirname, '../public/images');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
for (const file of files) {
  try {
    const size = getJpegSize(path.join(dir, file));
    const stats = fs.statSync(path.join(dir, file));
    console.log(`${file}: ${size ? `${size.width}x${size.height}` : 'unknown'} (${Math.round(stats.size/1024)} KB)`);
  } catch (e) {
    console.log(`${file}: error ${e.message}`);
  }
}
