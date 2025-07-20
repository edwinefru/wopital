const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a simple DigiCare logo
function createLogo() {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1976d2';
  ctx.fillRect(0, 0, size, size);

  // Medical cross
  ctx.fillStyle = '#ffffff';
  const crossSize = size * 0.4;
  const crossX = (size - crossSize) / 2;
  const crossY = (size - crossSize) / 2;
  
  // Vertical part of cross
  ctx.fillRect(crossX + crossSize * 0.4, crossY, crossSize * 0.2, crossSize);
  // Horizontal part of cross
  ctx.fillRect(crossX, crossY + crossSize * 0.4, crossSize, crossSize * 0.2);

  // Add "DC" text
  ctx.fillStyle = '#1976d2';
  ctx.font = `bold ${size * 0.15}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('DC', size / 2, size * 0.8);

  return canvas;
}

// Generate different sizes
const sizes = [1024, 512, 192, 144, 96, 72, 48];

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#1976d2';
  ctx.fillRect(0, 0, size, size);

  // Medical cross
  ctx.fillStyle = '#ffffff';
  const crossSize = size * 0.4;
  const crossX = (size - crossSize) / 2;
  const crossY = (size - crossSize) / 2;
  
  // Vertical part of cross
  ctx.fillRect(crossX + crossSize * 0.4, crossY, crossSize * 0.2, crossSize);
  // Horizontal part of cross
  ctx.fillRect(crossX, crossY + crossSize * 0.4, crossSize, crossSize * 0.2);

  // Add "DC" text
  ctx.fillStyle = '#1976d2';
  ctx.font = `bold ${size * 0.15}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('DC', size / 2, size * 0.8);

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`./assets/icon-${size}.png`, buffer);
});

console.log('Logos generated successfully!'); 