import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

async function optimizeImage(inputPath, outputPath, options = {}) {
  const { width, quality = 85 } = options;
  
  try {
    let pipeline = sharp(inputPath);
    
    if (width) {
      pipeline = pipeline.resize(width, width, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
    }
    
    await pipeline
      .png({ quality, compressionLevel: 9 })
      .toFile(outputPath + '.tmp');
    
    // Replace original with optimized
    const { rename } = await import('fs/promises');
    await rename(outputPath + '.tmp', outputPath);
    
    const originalStats = await stat(inputPath);
    const newStats = await stat(outputPath);
    const savings = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);
    
    console.log(`✅ ${outputPath.split('/').pop()}: ${(originalStats.size / 1024).toFixed(1)}KB → ${(newStats.size / 1024).toFixed(1)}KB (-${savings}%)`);
  } catch (error) {
    console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting icon optimization...\n');
  
  // Optimize main public icons
  const mainIcons = [
    { file: 'pwa-512x512.png', width: 512 },
    { file: 'pwa-192x192.png', width: 192 },
    { file: 'apple-touch-icon.png', width: 180 },
    { file: 'favicon.png', width: 32 },
  ];
  
  console.log('📁 Optimizing /public icons...');
  for (const icon of mainIcons) {
    const path = join(publicDir, icon.file);
    try {
      await stat(path);
      await optimizeImage(path, path, { width: icon.width, quality: 85 });
    } catch {
      console.log(`⚠️ Skipping ${icon.file} (not found)`);
    }
  }
  
  // Optimize /public/icons folder
  console.log('\n📁 Optimizing /public/icons...');
  try {
    const files = await readdir(iconsDir);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    
    for (const file of pngFiles) {
      const path = join(iconsDir, file);
      // Extract size from filename if possible
      const sizeMatch = file.match(/(\d+)/);
      const size = sizeMatch ? parseInt(sizeMatch[1]) : undefined;
      await optimizeImage(path, path, { width: size, quality: 85 });
    }
  } catch (error) {
    console.error('Failed to read icons directory:', error.message);
  }
  
  console.log('\n✨ Optimization complete!');
}

main();
