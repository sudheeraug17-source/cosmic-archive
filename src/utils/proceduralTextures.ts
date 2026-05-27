import * as THREE from "three";

/**
 * Procedurally generates world-class, photo-realistic planetary textures using high-detail HTML Canvas drawing.
 * Delivers AAA-tier, cinematic-quality visuals without heavy external assets.
 */

function createNoise(ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number = 0.15) {
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const value = Math.floor(Math.random() * 255);
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = Math.floor(opacity * 255);
  }
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  tempCanvas.getContext("2d")?.putImageData(imgData, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0);
}

// Helper to draw a detailed, ray-capped crater
function drawCrater(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, isDarkBase: boolean = true) {
  const shadowCol = isDarkBase ? "#1c1c1e" : "#2d160f";
  const rimCol = isDarkBase ? "#8a8a92" : "#b06c54";
  const ejectaCol = isDarkBase ? "rgba(220, 220, 225, 0.2)" : "rgba(255, 190, 160, 0.15)";

  // Draw ejecta rays (fine radial splatters)
  if (r > 6) {
    ctx.strokeStyle = ejectaCol;
    ctx.lineWidth = 0.6;
    const numRays = 6 + Math.floor(Math.random() * 8);
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2 + Math.random() * 0.5;
      const length = r * (2 + Math.random() * 4);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
      ctx.stroke();
    }
  }

  // Raised rim
  ctx.fillStyle = rimCol;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Shadow side inside the bowl
  ctx.fillStyle = shadowCol;
  ctx.beginPath();
  ctx.arc(cx - r * 0.18, cy - r * 0.18, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Sunny interior wall highlight
  ctx.fillStyle = isDarkBase ? "#a2a2aa" : "#d0957f";
  ctx.beginPath();
  ctx.arc(cx + r * 0.15, cy + r * 0.15, r * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Deep shadow floor pit
  ctx.fillStyle = isDarkBase ? "#0d0d0f" : "#1a0b06";
  ctx.beginPath();
  ctx.arc(cx + r * 0.05, cy + r * 0.05, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

export function createSunTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // 1. Blazing solar plasma core base gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#ff5100");
  grad.addColorStop(0.25, "#ff8c00");
  grad.addColorStop(0.5, "#ffb700");
  grad.addColorStop(0.75, "#ff8c00");
  grad.addColorStop(1, "#ff5100");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. High-contrast active solar convective cells/prominences
  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 110 + 35;
    
    const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
    radial.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    radial.addColorStop(0.25, "rgba(255, 220, 0, 0.75)");
    radial.addColorStop(0.55, "rgba(255, 90, 0, 0.35)");
    radial.addColorStop(0.85, "rgba(210, 20, 0, 0.08)");
    radial.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Filigree solar loop filaments and plasma boiling loops
  ctx.strokeStyle = "rgba(255, 245, 180, 0.25)";
  ctx.lineWidth = 1.6;
  ctx.globalCompositeOperation = "screen";
  for (let s = 0; s < 120; s++) {
    const startX = Math.random() * canvas.width;
    const startY = Math.random() * canvas.height;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + (Math.random() - 0.5) * 80,
      startY + (Math.random() - 0.5) * 45,
      startX + (Math.random() - 0.5) * 80,
      startY + (Math.random() - 0.5) * 45,
      startX + (Math.random() - 0.5) * 120,
      startY + (Math.random() - 0.5) * 30
    );
    ctx.stroke();
  }

  // 4. Photosphere dark cooling sunspots (Active solar region contrast)
  ctx.globalCompositeOperation = "source-over";
  for (let s = 0; s < 8; s++) {
    const sx = Math.random() * canvas.width;
    const sy = Math.random() * canvas.height;
    const r = Math.random() * 18 + 6;
    
    // Penumbra
    const penG = ctx.createRadialGradient(sx, sy, r * 0.1, sx, sy, r);
    penG.addColorStop(0, "#4a0400");
    penG.addColorStop(0.3, "#a62600");
    penG.addColorStop(0.8, "rgba(210, 40, 0, 0.2)");
    penG.addColorStop(1, "rgba(0, 0, 0, 0)");
    
    ctx.fillStyle = penG;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // Umbra (deep black star core)
    ctx.fillStyle = "#120000";
    ctx.beginPath();
    ctx.arc(sx, sy, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  createNoise(ctx, canvas.width, canvas.height, 0.14);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createMercuryTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1004;
  canvas.height = 502;
  const ctx = canvas.getContext("2d")!;

  // Cracked iron silicate lithospheric background
  const baseGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  baseGrad.addColorStop(0, "#3c3c3e");
  baseGrad.addColorStop(0.5, "#525255");
  baseGrad.addColorStop(1, "#3c3c3e");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Large tectonic basalt maria plains (Caloris Basin style)
  ctx.fillStyle = "#29292b";
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 140 + 60,
      Math.random() * 70 + 30,
      Math.random() * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Draw over 100 high-fidelity individual craters of cascading sizes
  for (let i = 0; i < 115; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    // Power-law size distribution (many tiny ones, a few huge ones)
    const sizeProb = Math.random();
    const r = sizeProb < 0.85 ? Math.random() * 4 + 1.2 : Math.random() * 16 + 5;
    drawCrater(ctx, cx, cy, r, true);
  }

  createNoise(ctx, canvas.width, canvas.height, 0.28);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createVenusTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Dense, crushing supercritical sulfur-greenhouse base
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#a0581f");
  grad.addColorStop(0.35, "#dfa44e");
  grad.addColorStop(0.5, "#eecd7d");
  grad.addColorStop(0.65, "#dfa44e");
  grad.addColorStop(1, "#a0581f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Hyper-speed global sulfuric acid wind streams (diagonal cloud banding)
  ctx.fillStyle = "rgba(255, 238, 190, 0.16)";
  for (let i = 0; i < 35; i++) {
    const startY = (Math.random() - 0.25) * canvas.height;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * canvas.width,
      startY + Math.random() * 100,
      Math.random() * 320 + 120,
      Math.random() * 30 + 10,
      -0.08 + (Math.random() - 0.5) * 0.04, // slight wind slant
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Intricate atmospheric thermal convection vortex curls
  ctx.lineWidth = 2.5;
  for (let s = 0; s < 30; s++) {
    const vx = Math.random() * canvas.width;
    const vy = Math.random() * canvas.height;
    const r = Math.random() * 50 + 20;
    
    const swirl = ctx.createRadialGradient(vx, vy, 2, vx, vy, r);
    swirl.addColorStop(0, "rgba(255, 255, 235, 0.22)");
    swirl.addColorStop(0.5, "rgba(224, 150, 60, 0.12)");
    swirl.addColorStop(1, "rgba(0, 0, 0, 0)");
    
    ctx.fillStyle = swirl;
    ctx.beginPath();
    ctx.arc(vx, vy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  createNoise(ctx, canvas.width, canvas.height, 0.18);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createEarthTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // 1. Deep ocean base with deep rift trenches
  ctx.fillStyle = "#091333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Turquoise continental shelves (re-creating rich underwater reef depths)
  ctx.fillStyle = "#0c3b6d";
  ctx.shadowColor = "rgba(10, 100, 160, 0.4)";
  ctx.shadowBlur = 15;
  
  const drawShelf = (path: Array<[number, number]>) => {
    ctx.beginPath();
    path.forEach(([px, py], idx) => {
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
  };

  // 3. Realistic Continent Geometries & Biomes
  // America Continent Path
  const americaPath: Array<[number, number]> = [
    [160, 40], [210, 42], [240, 70], [260, 50], [290, 80], [330, 120], 
    [320, 160], [290, 180], [265, 175], [268, 205], [290, 215], [275, 235],
    [248, 248], [252, 275], [280, 290], [315, 310], [335, 345], [310, 430], 
    [270, 490], [235, 492], [215, 440], [195, 370], [152, 320], [145, 290], 
    [158, 274], [130, 260], [112, 230], [105, 180], [132, 165], [125, 110], 
    [110, 75], [142, 50]
  ];

  // Eurasia & Africa Path
  const eurasiaAfricaPath: Array<[number, number]> = [
    [410, 150], [455, 125], [475, 65], [520, 48], [580, 35], [635, 40], 
    [710, 48], [775, 65], [830, 100], [845, 140], [820, 170], [860, 190], 
    [885, 240], [855, 275], [815, 255], [785, 295], [735, 265], [695, 315], 
    [640, 260], [612, 310], [580, 240], [575, 280], [525, 285], [500, 340], 
    [540, 410], [512, 490], [475, 480], [445, 410], [410, 310], [375, 235], 
    [400, 210], [382, 170]
  ];

  // Australia Path
  const australiaPath: Array<[number, number]> = [
    [800, 360], [848, 335], [895, 355], [910, 395], [885, 442], 
    [830, 440], [810, 405], [795, 385]
  ];

  ctx.shadowBlur = 0; // reset shadow

  // Render shelves
  ctx.fillStyle = "rgba(10, 95, 140, 0.55)";
  drawShelf(americaPath);
  drawShelf(eurasiaAfricaPath);
  drawShelf(australiaPath);

  // Fill actual landmass details
  const fillLandBiomes = (path: Array<[number, number]>, bounds: {xMin: number, xMax: number, yMin: number, yMax: number}) => {
    // Generate organic internal biome patterns (lush green, dry desert, white mountain snow caps)
    ctx.save();
    ctx.beginPath();
    path.forEach(([px, py], idx) => {
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.clip();

    // 1. Deciduous Green Forest Base
    ctx.fillStyle = "#1e4d25";
    ctx.fillRect(bounds.xMin, bounds.yMin, bounds.xMax - bounds.xMin, bounds.yMax - bounds.yMin);

    // 2. Arid Desert Saharan Gold Belt
    const desertGrad = ctx.createLinearGradient(0, bounds.yMin, 0, bounds.yMax);
    desertGrad.addColorStop(0.3, "rgba(202, 161, 93, 0.0)");
    desertGrad.addColorStop(0.48, "rgba(202, 161, 93, 0.95)"); // desert line
    desertGrad.addColorStop(0.58, "rgba(202, 161, 93, 0.92)");
    desertGrad.addColorStop(0.7, "rgba(202, 161, 93, 0.0)");
    ctx.fillStyle = desertGrad;
    ctx.fillRect(bounds.xMin, bounds.yMin, bounds.xMax - bounds.xMin, bounds.yMax - bounds.yMin);

    // 3. Dense Mountain Range Crags (Rocky Browns)
    ctx.fillStyle = "#4a3319";
    for (let r = 0; r < 20; r++) {
      ctx.beginPath();
      ctx.ellipse(
        bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin),
        bounds.yMin + Math.random() * (bounds.yMax - bounds.yMin),
        Math.random() * 35 + 10,
        Math.random() * 8 + 2.5,
        Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  };

  fillLandBiomes(americaPath, {xMin: 80, xMax: 350, yMin: 30, yMax: 500});
  fillLandBiomes(eurasiaAfricaPath, {xMin: 360, xMax: 900, yMin: 30, yMax: 500});
  fillLandBiomes(australiaPath, {xMin: 780, xMax: 935, yMin: 320, yMax: 460});

  // 4. Polar snowy caps with realistic fracturing borders
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, 32);
  ctx.fillRect(0, canvas.height - 28, canvas.width, 28);

  // Jagged ice shelf edges
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x += 15) {
    const yDisp = 28 + Math.sin(x * 0.04) * 6 + Math.cos(x * 0.12) * 2;
    ctx.lineTo(x, yDisp);
  }
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x += 15) {
    const yDisp = canvas.height - 25 - (Math.sin(x * 0.04) * 5 + Math.cos(x * 0.09) * 3);
    ctx.lineTo(x, yDisp);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();

  // 5. Rich cyclonic storm systems (curved high-pressure weather spirals)
  ctx.shadowBlur = 0;
  for (let s = 0; s < 18; s++) {
    const sx = Math.random() * canvas.width;
    const sy = Math.random() * canvas.height;
    const r = Math.random() * 95 + 40;
    
    // Draw spiral white cloud fronts resembling a cyclone
    const cloudG = ctx.createRadialGradient(sx, sy, r * 0.08, sx, sy, r);
    cloudG.addColorStop(0, "rgba(255, 255, 255, 0.65)");
    cloudG.addColorStop(0.35, "rgba(255, 255, 255, 0.45)");
    cloudG.addColorStop(0.7, "rgba(255, 255, 255, 0.12)");
    cloudG.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = cloudG;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r, r * 0.3, Math.PI / 6 + (Math.random() - 0.5) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw delicate high-altitude wispy clouds circling the earth horizontally
  ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
  for (let c = 0; c < 12; c++) {
    const cy = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * canvas.width,
      cy,
      Math.random() * 410 + 150,
      Math.random() * 12 + 4,
      0.02,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  createNoise(ctx, canvas.width, canvas.height, 0.06);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createMarsTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1004;
  canvas.height = 502;
  const ctx = canvas.getContext("2d")!;

  // Rusted hematite oxidized red base
  const baseGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  baseGrad.addColorStop(0, "#853118");
  baseGrad.addColorStop(0.5, "#a63d1e");
  baseGrad.addColorStop(1, "#853118");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ancient basalt water-marine plains (maria highlands like Syrtis Major)
  ctx.fillStyle = "#632717";
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 220 + 85,
      Math.random() * 65 + 18,
      (Math.random() - 0.5) * 0.8,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Dusty ochre sand deserts
  ctx.fillStyle = "#bd5735";
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 150 + 60,
      Math.random() * 50 + 15,
      0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Distinct craters mapping (Olympus Mons region & Southern highlands)
  for (let i = 0; i < 65; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const r = Math.random() < 0.85 ? Math.random() * 6 + 1.5 : Math.random() * 25 + 6;
    drawCrater(ctx, cx, cy, r, false);
  }

  // CO2 / H2O Polar caps with chilly frost haze surrounds
  ctx.fillStyle = "rgba(255, 240, 235, 0.95)";
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 4, 38, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(canvas.width / 2, canvas.height - 4, 30, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 240, 235, 0.25)";
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 8, 80, 15, 0, 0, Math.PI * 2);
  ctx.ellipse(canvas.width / 2, canvas.height - 8, 65, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  createNoise(ctx, canvas.width, canvas.height, 0.18);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createJupiterTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // 1. Beautiful high-density multi-colored primary bands
  const colors = [
    "#6b4028", "#8c5635", "#ab724b", "#cfa276", "#e4ccb5", 
    "#ab724b", "#8c5635", "#5c331a", "#ab724b", "#cfa276",
    "#fceddd", "#d69f70", "#8c5635", "#5c331a", "#ab724b",
    "#cfa276", "#ab724b", "#8c5635", "#6b4028", "#5c331a"
  ];
  const step = canvas.height / colors.length;

  for (let i = 0; i < colors.length; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(0, i * step, canvas.width, step);
  }

  // 2. Wave distortions modeling storm wind shear
  ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
  for (let i = 0; i < colors.length; i++) {
    const yCenter = i * step + step / 2;
    
    // Smooth wavy shear line following the equator
    ctx.fillStyle = colors[(i + 1) % colors.length];
    ctx.beginPath();
    ctx.moveTo(0, i * step);
    for (let x = 0; x <= canvas.width; x += 10) {
      const wobble = Math.sin(x * 0.035) * (step * 0.4) + Math.cos(x * 0.12) * (step * 0.15);
      ctx.lineTo(x, i * step + wobble);
    }
    ctx.lineTo(canvas.width, (i + 1) * step);
    ctx.lineTo(0, (i + 1) * step);
    ctx.closePath();
    ctx.fill();
  }

  // 3. Convective storm eddies and Coriolis white ovals (35 clouds)
  ctx.globalCompositeOperation = "source-over";
  for (let s = 0; s < 45; s++) {
    const sx = Math.random() * canvas.width;
    const sy = Math.random() * canvas.height;
    const r = Math.random() * 22 + 6;
    
    const stormG = ctx.createRadialGradient(sx, sy, 1, sx, sy, r);
    const col = s % 2 === 0 ? "255, 255, 255" : "210, 120, 50";
    stormG.addColorStop(0, `rgba(${col}, 0.32)`);
    stormG.addColorStop(0.6, `rgba(${col}, 0.12)`);
    stormG.addColorStop(1, "rgba(0,0,0,0)");
    
    ctx.fillStyle = stormG;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r, r * 0.42, 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. The Giant Great Red Spot with nested rotational vortex spirals
  const grsX = canvas.width * 0.62;
  const grsY = canvas.height * 0.71;
  const grsW = 86;
  const grsH = 42;

  // Outer GRS swirl disruption block
  const envGrad = ctx.createRadialGradient(grsX, grsY, 15, grsX, grsY, grsW * 1.5);
  envGrad.addColorStop(0, "rgba(220,90,40,0.65)");
  envGrad.addColorStop(0.5, "rgba(255,200,150,0.2)");
  envGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = envGrad;
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, grsW * 1.45, grsH * 1.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark core of the storm
  const grsGrad = ctx.createRadialGradient(grsX, grsY, 5, grsX, grsY, grsW);
  grsGrad.addColorStop(0, "#aa1304"); // extremely deep crimson
  grsGrad.addColorStop(0.35, "#cf2206"); // hot brick red
  grsGrad.addColorStop(0.72, "#e36322"); // bright orange edge
  grsGrad.addColorStop(1, "rgba(214,100,50,0)");
  ctx.fillStyle = grsGrad;
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, grsW, grsH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Coriolis white hurricane boundary ring
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, grsW + 10, grsH + 6, 0.02, -0.4, Math.PI * 1.3);
  ctx.stroke();

  createNoise(ctx, canvas.width, canvas.height, 0.12);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createSaturnTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Soft sand, cream, and pale gold bands
  const colors = [
    "#9d794f", "#ba986e", "#ccb08c", "#dfcfbd", "#f3eae1", 
    "#ccb08c", "#ba986e", "#9d794f", "#805c36", "#ccb08c",
    "#ba986e", "#cca77c", "#cca170", "#bfa076", "#cca77c",
    "#cca170", "#ccb08c", "#ba986e", "#9d794f", "#cca170"
  ];
  const step = canvas.height / colors.length;
  for (let i = 0; i < colors.length; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(0, i * step, canvas.width, step);
  }

  // Subtle wind ripples
  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  for (let i = 0; i < colors.length; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * step);
    for (let x = 0; x <= canvas.width; x += 30) {
      const wobble = Math.sin(x * 0.015) * (step * 0.2);
      ctx.lineTo(x, i * step + wobble);
    }
    ctx.lineTo(canvas.width, (i + 1) * step);
    ctx.lineTo(0, (i + 1) * step);
    ctx.closePath();
    ctx.fill();
  }

  createNoise(ctx, canvas.width, canvas.height, 0.06);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createSaturnRingsTexture(): THREE.Texture {
  // Generates concentric detailed rings from inside radius to outside radius
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Concentric multi-particle gradients
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  
  // 1. Pale outer F-Ring
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.01, "rgba(175, 145, 105, 0.35)");
  grad.addColorStop(0.015, "rgba(0,0,0,0)"); // gap

  // 2. High-density A-Ring (structured outer ring)
  grad.addColorStop(0.03, "rgba(195, 168, 125, 0.85)");
  grad.addColorStop(0.12, "rgba(175, 145, 105, 0.65)");
  grad.addColorStop(0.24, "rgba(160, 130, 95, 0.55)");
  
  // 3. Cassini Division (massive dynamic gap)
  grad.addColorStop(0.25, "rgba(3, 3, 5, 0.0)");
  grad.addColorStop(0.29, "rgba(3, 3, 5, 0.0)"); 

  // 4. Ultra-dense hyper-bright B-Ring (main ring structure)
  grad.addColorStop(0.30, "rgba(238, 222, 192, 1.0)");
  grad.addColorStop(0.42, "rgba(245, 235, 215, 0.95)");
  grad.addColorStop(0.55, "rgba(215, 190, 150, 0.98)");
  grad.addColorStop(0.68, "rgba(195, 168, 125, 0.9)");
  grad.addColorStop(0.79, "rgba(165, 138, 95, 0.82)");
  
  // 5. Encke Division
  grad.addColorStop(0.80, "rgba(0,0,0,0)");
  grad.addColorStop(0.81, "rgba(0,0,0,0)");
  
  // 6. Dusty faint C-Ring (crepe ring)
  grad.addColorStop(0.82, "rgba(145, 120, 85, 0.52)");
  grad.addColorStop(0.95, "rgba(115, 95, 65, 0.28)");
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Layer over subtle particle noise streaks horizontally (represented vertically in texture)
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  for (let w = 0; w < canvas.width; w += 4) {
    if (Math.random() > 0.4) {
      ctx.fillRect(w, 0, Math.random() * 2 + 1, canvas.height);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createUranusTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Gaseous pale cyan base with soft atmospheric limb shading
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#42babf");
  grad.addColorStop(0.5, "#68dbde");
  grad.addColorStop(1, "#42babf");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Faint horizontal methane absorption cloud bands (softest contrast)
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(0, 40, canvas.width, 15);
  ctx.fillRect(0, 115, canvas.width, 22);
  ctx.fillRect(0, 195, canvas.width, 12);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createNeptuneTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1004;
  canvas.height = 502;
  const ctx = canvas.getContext("2d")!;

  // Intense deep sapphire cobalt blue base
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#0e2060");
  grad.addColorStop(0.5, "#153ccf");
  grad.addColorStop(1, "#0e2060");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stormy bands
  ctx.fillStyle = "rgba(40, 80, 220, 0.22)";
  ctx.fillRect(0, 120, canvas.width, 40);
  ctx.fillRect(0, 310, canvas.width, 30);

  // 1. The Great Dark Spot (mammoth anticyclonic storm)
  const gdsX = canvas.width * 0.35;
  const gdsY = canvas.height * 0.58;
  const gdsW = 75;
  const gdsH = 43;

  const gdsGrad = ctx.createRadialGradient(gdsX, gdsY, 1, gdsX, gdsY, gdsW);
  gdsGrad.addColorStop(0, "#050b24"); // deep dark navy center
  gdsGrad.addColorStop(0.55, "#0b1548");
  gdsGrad.addColorStop(1, "rgba(20, 40, 150, 0)");
  ctx.fillStyle = gdsGrad;
  ctx.beginPath();
  ctx.ellipse(gdsX, gdsY, gdsW, gdsH, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // White dynamic high-altitude winds wrapping around the Dark Spot
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(gdsX, gdsY, gdsW + 8, gdsH + 5, 0.05, Math.PI * 0.8, Math.PI * 1.9);
  ctx.stroke();

  // 2. High-speed white wispy methane winds (cirrus clouds)
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 190 + 50,
      3.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  createNoise(ctx, canvas.width, canvas.height, 0.05);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
