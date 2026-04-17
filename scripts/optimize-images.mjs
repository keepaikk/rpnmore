#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public');
const imagesDir = path.join(publicDir, 'images');
const webpDir = path.join(imagesDir, 'webp');

// Ensure webp directory exists
await fs.mkdir(webpDir, { recursive: true });

const images = [
  'book-family-wrath.png',
  'book-naked-window.png',
  'book-darkness-cover-v3.jpg',
  'book-darkness-light-new.png'
];

const sizes = [400, 800, 1200];

console.log('🖼️  Image Optimization for rpnmore.com');
console.log('========================================\n');

const results = [];

for (const image of images) {
  const inputPath = path.join(imagesDir, image);
  const baseName = path.parse(image).name;
  
  try {
    const inputStats = await fs.stat(inputPath);
    const originalSize = inputStats.size;
    
    console.log(`Processing: ${image}`);
    console.log(`  Original: ${(originalSize / 1024).toFixed(1)} KiB`);
    
    // Generate WebP versions for each size
    for (const width of sizes) {
      const outputPath = path.join(webpDir, `${baseName}-${width}w.webp`);
      
      await sharp(inputPath)
        .resize(width, null, { 
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3
        })
        .webp({ 
          quality: 85,
          effort: 6,
          smartSubsample: true
        })
        .toFile(outputPath);
      
      const outputStats = await fs.stat(outputPath);
      const newSize = outputStats.size;
      
      console.log(`  ${width}w: ${(newSize / 1024).toFixed(1)} KiB (WebP)`);
    }
    
    // Also create a full-size WebP version
    const fullSizeWebp = path.join(webpDir, `${baseName}.webp`);
    await sharp(inputPath)
      .webp({ 
        quality: 85,
        effort: 6,
        smartSubsample: true
      })
      .toFile(fullSizeWebp);
    
    const fullSizeStats = await fs.stat(fullSizeWebp);
    
    results.push({
      image,
      original: (originalSize / 1024).toFixed(1),
      webpFull: (fullSizeStats.size / 1024).toFixed(1),
      savings: ((1 - fullSizeStats.size / originalSize) * 100).toFixed(1)
    });
    
    console.log(`  Full-size WebP: ${(fullSizeStats.size / 1024).toFixed(1)} KiB`);
    console.log(`  Savings: ${((1 - fullSizeStats.size / originalSize) * 100).toFixed(1)}%\n`);
    
  } catch (err) {
    console.error(`  Error: ${err.message}\n`);
  }
}

// Generate summary
console.log('========================================');
console.log('📊 SUMMARY');
console.log('========================================\n');

let totalOriginal = 0;
let totalWebP = 0;

for (const r of results) {
  console.log(`${r.image}:`);
  console.log(`  Original: ${r.original} KiB → WebP: ${r.webpFull} KiB`);
  console.log(`  Saved: ${r.savings}%\n`);
  totalOriginal += parseFloat(r.original);
  totalWebP += parseFloat(r.webpFull);
}

console.log(`Total Original: ${totalOriginal.toFixed(1)} KiB`);
console.log(`Total WebP: ${totalWebP.toFixed(1)} KiB`);
console.log(`Total Savings: ${((1 - totalWebP / totalOriginal) * 100).toFixed(1)}%`);
console.log(`Space Saved: ${(totalOriginal - totalWebP).toFixed(1)} KiB`);

// List generated files
console.log('\n📁 Generated Files:');
const webpFiles = await fs.readdir(webpDir);
for (const f of webpFiles.sort()) {
  const stats = await fs.stat(path.join(webpDir, f));
  console.log(`  ${f}: ${(stats.size / 1024).toFixed(1)} KiB`);
}