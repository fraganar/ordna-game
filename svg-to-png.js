const sharp = require('sharp');
const fs = require('fs');

async function convertSvgToPng() {
    const svgBuffer = fs.readFileSync('images/mango.svg');
    
    // Generate 192x192 icon
    await sharp(svgBuffer)
        .resize(192, 192)
        .png()
        .toFile('icon-192.png');
    console.log('✅ Generated icon-192.png from SVG');
    
    // Generate 512x512 icon
    await sharp(svgBuffer)
        .resize(512, 512)
        .png()
        .toFile('icon-512.png');
    console.log('✅ Generated icon-512.png from SVG');
}

console.log('🥭 Converting mango.svg to PNG icons...');
convertSvgToPng()
    .then(() => console.log('✨ Done! Icons have been generated from SVG.'))
    .catch(err => console.error('Error:', err));