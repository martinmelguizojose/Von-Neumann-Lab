import * as THREE from 'three';

/**
 * Procedural textures generator for Three.js.
 * Zero external file dependencies - 100% generated with HTML5 Canvas.
 */

export function createPcbTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark tech PCB base
  ctx.fillStyle = '#081420';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle grid lines
  ctx.strokeStyle = '#0e2438';
  ctx.lineWidth = 1;
  const step = 32;
  for (let x = 0; x <= 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Printed circuit traces (copper & gold traces)
  ctx.strokeStyle = '#1b4a68';
  ctx.lineWidth = 2.5;

  // Horizontal and diagonal bus lines
  for (let i = 0; i < 16; i++) {
    const y = 300 + i * 28;
    ctx.beginPath();
    ctx.moveTo(120, y);
    ctx.lineTo(480, y);
    ctx.lineTo(540, y + 40);
    ctx.lineTo(900, y + 40);
    ctx.stroke();
  }

  // Gold circular test points / solder pads
  ctx.fillStyle = '#eab308';
  for (let x = 160; x < 880; x += 64) {
    for (let y = 160; y < 880; y += 128) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Silkscreen white text labels
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('VON NEUMANN ARCHITECTURE MOTHERBOARD // REV 3.0', 120, 80);
  ctx.fillText('BUS WIDTH: 64-BIT // CLOCK: SYNC', 120, 105);
  ctx.fillText('SOCKET CPU-01', 200, 240);
  ctx.fillText('DIMM SLOT MEMORY-01', 650, 240);
  ctx.fillText('IO INTERFACE BUS CONTROLLER', 200, 780);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createChipTexture(label: string, sublabel: string, renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Matte dark charcoal silicon substrate
  ctx.fillStyle = '#181a1e';
  ctx.fillRect(0, 0, 512, 512);

  // Metallic border bevel
  ctx.strokeStyle = '#383b42';
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 492, 492);

  // Gold pin 1 corner notch
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(45, 45, 14, 0, Math.PI * 2);
  ctx.fill();

  // Laser engraved typography
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 38px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, 256, 230);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px monospace';
  ctx.fillText(sublabel, 256, 280);

  ctx.font = '16px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('VON NEUMANN 1945 // ARCH_STD', 256, 330);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}
