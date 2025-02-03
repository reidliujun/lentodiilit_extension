const { createCanvas } = require('canvas');
const fs = require('fs');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#4CAF50';  // Changed to green
    ctx.fillRect(0, 0, size, size);

    // Bot head (rectangle)
    ctx.fillStyle = 'white';
    ctx.fillRect(size * 0.2, size * 0.2, size * 0.6, size * 0.6);

    // Bot eyes
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(size * 0.3, size * 0.35, size * 0.15, size * 0.15);
    ctx.fillRect(size * 0.55, size * 0.35, size * 0.15, size * 0.15);

    // Bot mouth
    ctx.fillRect(size * 0.3, size * 0.6, size * 0.4, size * 0.1);

    // Antenna
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.2);
    ctx.lineTo(size * 0.5, size * 0.1);
    ctx.lineWidth = size * 0.05;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Save the icon
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon${size}.png`, buffer);
}

// Generate both sizes
createIcon(48);
createIcon(128);

console.log('Icons generated successfully!');