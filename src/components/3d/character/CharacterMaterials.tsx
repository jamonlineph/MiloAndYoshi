import * as THREE from 'three';

type SurfaceKind = 'fur' | 'short-fur' | 'fabric' | 'skin' | 'hair' | 'leather';

interface SurfacePair {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

interface CharacterMaterialProps {
  color: string;
  roughness?: number;
  bumpScale?: number;
}

const TEXTURE_SIZE = 128;

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function configureTexture(texture: THREE.CanvasTexture, repeat: number, color = false) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
}

function createSurface(kind: SurfaceKind, seed: number, repeat: number): SurfacePair {
  const random = mulberry32(seed);
  const colorCanvas = document.createElement('canvas');
  const bumpCanvas = document.createElement('canvas');
  colorCanvas.width = bumpCanvas.width = TEXTURE_SIZE;
  colorCanvas.height = bumpCanvas.height = TEXTURE_SIZE;
  const colorContext = colorCanvas.getContext('2d')!;
  const bumpContext = bumpCanvas.getContext('2d')!;
  const colorImage = colorContext.createImageData(TEXTURE_SIZE, TEXTURE_SIZE);
  const bumpImage = bumpContext.createImageData(TEXTURE_SIZE, TEXTURE_SIZE);

  for (let y = 0; y < TEXTURE_SIZE; y += 1) {
    for (let x = 0; x < TEXTURE_SIZE; x += 1) {
      const index = (y * TEXTURE_SIZE + x) * 4;
      const fine = random() - 0.5;
      const broad = Math.sin((x + seed) * 0.17) * Math.cos((y - seed) * 0.13);
      const weave = kind === 'fabric'
        ? (x % 4 === 0 ? -7 : 0) + (y % 4 === 0 ? -6 : 0)
        : 0;
      const strand = kind === 'hair' ? Math.sin((x + y * 0.34) * 0.72) * 7 : 0;
      const pore = kind === 'skin' ? fine * 5 : fine * 12;
      const leatherMottle = kind === 'leather' ? broad * 7 + fine * 5 : 0;
      const furGrain = kind === 'fur' || kind === 'short-fur' ? broad * 5 + fine * 7 : 0;
      const colorValue = THREE.MathUtils.clamp(
        Math.round(240 + weave + strand + pore + leatherMottle + furGrain),
        205,
        252,
      );
      const bumpValue = THREE.MathUtils.clamp(
        Math.round(128 + weave * 2 + strand * 2 + pore * 3 + leatherMottle * 3 + furGrain * 4),
        30,
        225,
      );

      colorImage.data[index] = colorValue;
      colorImage.data[index + 1] = colorValue;
      colorImage.data[index + 2] = colorValue;
      colorImage.data[index + 3] = 255;
      bumpImage.data[index] = bumpValue;
      bumpImage.data[index + 1] = bumpValue;
      bumpImage.data[index + 2] = bumpValue;
      bumpImage.data[index + 3] = 255;
    }
  }

  colorContext.putImageData(colorImage, 0, 0);
  bumpContext.putImageData(bumpImage, 0, 0);

  if (kind === 'fur' || kind === 'short-fur') {
    const strokeCount = kind === 'fur' ? 520 : 760;
    colorContext.lineWidth = kind === 'fur' ? 0.8 : 0.55;
    bumpContext.lineWidth = kind === 'fur' ? 1.2 : 0.8;
    for (let index = 0; index < strokeCount; index += 1) {
      const x = random() * TEXTURE_SIZE;
      const y = random() * TEXTURE_SIZE;
      const length = kind === 'fur' ? 2.8 + random() * 4 : 1.4 + random() * 2.4;
      const drift = (random() - 0.5) * 1.4;
      colorContext.strokeStyle = `rgba(255,255,255,${0.035 + random() * 0.05})`;
      bumpContext.strokeStyle = `rgba(225,225,225,${0.12 + random() * 0.15})`;
      [colorContext, bumpContext].forEach((context) => {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + drift, y + length);
        context.stroke();
      });
    }
  }

  if (kind === 'leather') {
    bumpContext.strokeStyle = 'rgba(210,210,210,0.16)';
    bumpContext.lineWidth = 0.7;
    for (let index = 0; index < 90; index += 1) {
      const x = random() * TEXTURE_SIZE;
      const y = random() * TEXTURE_SIZE;
      bumpContext.beginPath();
      bumpContext.arc(x, y, 0.8 + random() * 1.7, 0, Math.PI * 1.4);
      bumpContext.stroke();
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(map, repeat, true);
  configureTexture(bumpMap, repeat);
  return { map, bumpMap };
}

const plushFur = createSurface('fur', 1187, 4.5);
const shortFur = createSurface('short-fur', 2203, 5.5);
const wovenFabric = createSurface('fabric', 3529, 6);
const skinSurface = createSurface('skin', 4481, 4);
const hairSurface = createSurface('hair', 5501, 5);
const leatherSurface = createSurface('leather', 6619, 4);

export function FurMaterial({ color, roughness = 0.88, bumpScale = 0.022 }: CharacterMaterialProps) {
  return (
    <meshStandardMaterial
      color={color}
      map={plushFur.map}
      bumpMap={plushFur.bumpMap}
      bumpScale={bumpScale}
      roughness={roughness}
      envMapIntensity={0.48}
    />
  );
}

export function ShortFurMaterial({ color, roughness = 0.84, bumpScale = 0.018 }: CharacterMaterialProps) {
  return (
    <meshStandardMaterial
      color={color}
      map={shortFur.map}
      bumpMap={shortFur.bumpMap}
      bumpScale={bumpScale}
      roughness={roughness}
      envMapIntensity={0.52}
    />
  );
}

export function FabricMaterial({ color, roughness = 0.92, bumpScale = 0.018 }: CharacterMaterialProps) {
  return (
    <meshStandardMaterial
      color={color}
      map={wovenFabric.map}
      bumpMap={wovenFabric.bumpMap}
      bumpScale={bumpScale}
      roughness={roughness}
      envMapIntensity={0.42}
    />
  );
}

export function SkinMaterial({ color, roughness = 0.7, bumpScale = 0.006 }: CharacterMaterialProps) {
  return (
    <meshStandardMaterial
      color={color}
      map={skinSurface.map}
      bumpMap={skinSurface.bumpMap}
      bumpScale={bumpScale}
      roughness={roughness}
      envMapIntensity={0.5}
    />
  );
}

export function HairMaterial({ color, roughness = 0.87, bumpScale = 0.02 }: CharacterMaterialProps) {
  return (
    <meshStandardMaterial
      color={color}
      map={hairSurface.map}
      bumpMap={hairSurface.bumpMap}
      bumpScale={bumpScale}
      roughness={roughness}
      envMapIntensity={0.42}
    />
  );
}

export function LeatherMaterial({ color, roughness = 0.84, bumpScale = 0.016 }: CharacterMaterialProps) {
  return (
    <meshStandardMaterial
      color={color}
      map={leatherSurface.map}
      bumpMap={leatherSurface.bumpMap}
      bumpScale={bumpScale}
      roughness={roughness}
      envMapIntensity={0.5}
    />
  );
}
