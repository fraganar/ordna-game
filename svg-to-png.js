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
    
    // Generate Apple Touch Icons
    await sharp(svgBuffer)
        .resize(180, 180)
        .png()
        .toFile('apple-touch-icon.png');
    console.log('✅ Generated apple-touch-icon.png (180x180) from SVG');
    
    // Additional iOS sizes
    await sharp(svgBuffer)
        .resize(152, 152)
        .png()
        .toFile('apple-touch-icon-152x152.png');
    console.log('✅ Generated apple-touch-icon-152x152.png from SVG');
    
    await sharp(svgBuffer)
        .resize(167, 167)
        .png()
        .toFile('apple-touch-icon-167x167.png');
    console.log('✅ Generated apple-touch-icon-167x167.png from SVG');
    
    // Open Graph image (larger for sharing)
    await sharp(svgBuffer)
        .resize(1200, 1200)
        .png()
        .toFile('og-image.png');
    console.log('✅ Generated og-image.png (1200x1200) for Open Graph');
}

console.log('🥭 Converting mango.svg to PNG icons...');
convertSvgToPng()
    .then(() => console.log('✨ Done! All icons have been generated from SVG.'))
    .catch(err => console.error('Error:', err));