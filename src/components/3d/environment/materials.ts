import * as THREE from 'three';

type RGB = [number, number, number];

interface TerrainMaterialOptions {
  name: string;
  dark: RGB;
  light: RGB;
  accent: RGB;
  repeat: number;
  roughness: number;
  bumpScale: number;
  seed: number;
  metalness?: number;
}

const TEXTURE_SIZE = 256;

function hash2(x: number, y: number, seed: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function smooth(value: number) {
  return value * value * (3 - 2 * value);
}

function periodicNoise(x: number, y: number, frequency: number, seed: number) {
  const px = (x / TEXTURE_SIZE) * frequency;
  const py = (y / TEXTURE_SIZE) * frequency;
  const x0 = Math.floor(px);
  const y0 = Math.floor(py);
  const tx = smooth(px - x0);
  const ty = smooth(py - y0);
  const x1 = (x0 + 1) % frequency;
  const y1 = (y0 + 1) % frequency;
  const wrappedX0 = ((x0 % frequency) + frequency) % frequency;
  const wrappedY0 = ((y0 % frequency) + frequency) % frequency;

  const a = hash2(wrappedX0, wrappedY0, seed);
  const b = hash2(x1, wrappedY0, seed);
  const c = hash2(wrappedX0, y1, seed);
  const d = hash2(x1, y1, seed);
  const top = THREE.MathUtils.lerp(a, b, tx);
  const bottom = THREE.MathUtils.lerp(c, d, tx);
  return THREE.MathUtils.lerp(top, bottom, ty);
}

function fbm(x: number, y: number, seed: number) {
  let value = 0;
  let amplitude = 0.58;
  let total = 0;
  [2, 4, 8, 16, 32].forEach((frequency, octave) => {
    value += periodicNoise(x, y, frequency, seed + octave * 19) * amplitude;
    total += amplitude;
    amplitude *= 0.52;
  });
  return value / total;
}

function mixColor(a: RGB, b: RGB, amount: number): RGB {
  return [
    Math.round(THREE.MathUtils.lerp(a[0], b[0], amount)),
    Math.round(THREE.MathUtils.lerp(a[1], b[1], amount)),
    Math.round(THREE.MathUtils.lerp(a[2], b[2], amount)),
  ];
}

function makeTexturePair(options: TerrainMaterialOptions) {
  const colorCanvas = document.createElement('canvas');
  const heightCanvas = document.createElement('canvas');
  colorCanvas.width = heightCanvas.width = TEXTURE_SIZE;
  colorCanvas.height = heightCanvas.height = TEXTURE_SIZE;

  const colorContext = colorCanvas.getContext('2d')!;
  const heightContext = heightCanvas.getContext('2d')!;
  const colorImage = colorContext.createImageData(TEXTURE_SIZE, TEXTURE_SIZE);
  const heightImage = heightContext.createImageData(TEXTURE_SIZE, TEXTURE_SIZE);

  for (let y = 0; y < TEXTURE_SIZE; y += 1) {
    for (let x = 0; x < TEXTURE_SIZE; x += 1) {
      const broad = fbm(x, y, options.seed);
      const fine = periodicNoise(x, y, 32, options.seed + 97);
      const grain = periodicNoise(x, y, 64, options.seed + 173);
      const height = THREE.MathUtils.clamp(broad * 0.72 + fine * 0.2 + grain * 0.08, 0, 1);
      // Keep albedo variation restrained. Surface relief comes primarily from
      // the bump texture; broad high-contrast noise reads as visual clutter at
      // the game's elevated third-person camera distance.
      const colorHeight = THREE.MathUtils.clamp(0.5 + (height - 0.5) * 0.42, 0.28, 0.72);
      const base = mixColor(options.dark, options.light, smooth(colorHeight));
      const accentMask = Math.max(0, fine - 0.8) * 1.35;
      const color = mixColor(base, options.accent, THREE.MathUtils.clamp(accentMask, 0, 0.15));
      const index = (y * TEXTURE_SIZE + x) * 4;

      colorImage.data[index] = color[0];
      colorImage.data[index + 1] = color[1];
      colorImage.data[index + 2] = color[2];
      colorImage.data[index + 3] = 255;

      const heightValue = Math.round(height * 255);
      heightImage.data[index] = heightValue;
      heightImage.data[index + 1] = heightValue;
      heightImage.data[index + 2] = heightValue;
      heightImage.data[index + 3] = 255;
    }
  }

  colorContext.putImageData(colorImage, 0, 0);
  heightContext.putImageData(heightImage, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  const bumpMap = new THREE.CanvasTexture(heightCanvas);
  [map, bumpMap].forEach((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(options.repeat, options.repeat);
    texture.anisotropy = 8;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
  });
  map.colorSpace = THREE.SRGBColorSpace;

  return { map, bumpMap };
}

function makeTerrainMaterial(options: TerrainMaterialOptions) {
  const { map, bumpMap } = makeTexturePair(options);
  const material = new THREE.MeshStandardMaterial({
    name: options.name,
    map,
    bumpMap,
    bumpScale: options.bumpScale,
    roughness: options.roughness,
    metalness: options.metalness ?? 0,
    envMapIntensity: 0.55,
  });
  material.color.set('#ffffff');
  return material;
}

export const grassMaterial = makeTerrainMaterial({
  name: 'Coastal meadow',
  dark: [73, 101, 67],
  light: [111, 135, 84],
  accent: [139, 134, 83],
  repeat: 10,
  roughness: 0.93,
  bumpScale: 0.07,
  seed: 7,
});

export const hillGrassMaterial = makeTerrainMaterial({
  name: 'Wind-worn hill grass',
  dark: [62, 87, 63],
  light: [101, 127, 88],
  accent: [132, 129, 86],
  repeat: 9,
  roughness: 0.95,
  bumpScale: 0.09,
  seed: 23,
});

export const sandMaterial = makeTerrainMaterial({
  name: 'Seaglass beach sand',
  dark: [188, 165, 127],
  light: [222, 205, 171],
  accent: [237, 224, 197],
  repeat: 12,
  roughness: 0.88,
  bumpScale: 0.06,
  seed: 41,
});

export const pathMaterial = makeTerrainMaterial({
  name: 'Shell aggregate path',
  dark: [163, 147, 124],
  light: [202, 187, 160],
  accent: [222, 210, 187],
  repeat: 4,
  roughness: 0.9,
  bumpScale: 0.055,
  seed: 59,
});

export const soilMaterial = makeTerrainMaterial({
  name: 'Garden soil',
  dark: [55, 39, 28],
  light: [105, 77, 51],
  accent: [139, 102, 68],
  repeat: 9,
  roughness: 1,
  bumpScale: 0.32,
  seed: 71,
});

export const cliffMaterial = makeTerrainMaterial({
  name: 'Coastal cliff stone',
  dark: [71, 65, 57],
  light: [132, 121, 102],
  accent: [91, 105, 80],
  repeat: 10,
  roughness: 0.98,
  bumpScale: 0.38,
  seed: 89,
});

export const plazaMaterial = makeTerrainMaterial({
  name: 'Pawprint plaza stone',
  dark: [136, 120, 100],
  light: [178, 159, 132],
  accent: [202, 185, 158],
  repeat: 5,
  roughness: 0.82,
  bumpScale: 0.065,
  seed: 107,
});
