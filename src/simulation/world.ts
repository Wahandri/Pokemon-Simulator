import { BiomeType, BerryBush, ElementalStone } from '../types/pokemon';

export const WORLD_WIDTH = 3200;
export const WORLD_HEIGHT = 2400;

export interface BiomeZone {
  type: BiomeType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  primaryColor: string;
  accentColor: string;
  description: string;
}

export const BIOMES: BiomeZone[] = [
  {
    type: 'forest',
    name: 'Bosque Viridian',
    x: 100,
    y: 100,
    width: 1200,
    height: 800,
    primaryColor: '#2d5a27',
    accentColor: '#1e3f1a',
    description: 'Espeso dosel arbóreo rico en bayas, hogar de insectos y plantas.',
  },
  {
    type: 'snow',
    name: 'Glaciar Pico Helado',
    x: 1100,
    y: 0,
    width: 1100,
    height: 480,
    primaryColor: '#d6eef8',
    accentColor: '#a8d8ea',
    description: 'Nieves perpetuas y témpanos donde habitan especies árticas.',
  },
  {
    type: 'mountain',
    name: 'Monte Moon & Desfiladeros',
    x: 2000,
    y: 100,
    width: 1100,
    height: 850,
    primaryColor: '#786850',
    accentColor: '#584838',
    description: 'Cavernas minerales y crestas de roca escarpada.',
  },
  {
    type: 'meadow',
    name: 'Pradera Verde Pallet',
    x: 200,
    y: 800,
    width: 1300,
    height: 800,
    primaryColor: '#589838',
    accentColor: '#488028',
    description: 'Llanura templada salpicada de flores, hierba alta y arboledas.',
  },
  {
    type: 'lake',
    name: 'Gran Lago Furia & Deltas',
    x: 1400,
    y: 650,
    width: 1100,
    height: 1050,
    primaryColor: '#3070b8',
    accentColor: '#1e4880',
    description: 'Aguas profundas alimentadas por ríos y orillas con juncos.',
  },
  {
    type: 'desert',
    name: 'Desierto de las Arenas',
    x: 100,
    y: 1550,
    width: 1200,
    height: 750,
    primaryColor: '#d8b060',
    accentColor: '#b89040',
    description: 'Dunas ardientes y fósiles milenarios bajo el sol inclemente.',
  },
  {
    type: 'volcano',
    name: 'Cráter Volcánico Cinnabar',
    x: 1900,
    y: 1500,
    width: 1200,
    height: 800,
    primaryColor: '#4a2820',
    accentColor: '#d03818',
    description: 'Grietas de magma y columnas de humo volcánico.',
  },
];

export function getBiomeAt(x: number, y: number): BiomeType {
  // Búsqueda por cuadrante
  if (y < 480 && x >= 1100 && x <= 2200) return 'snow';
  if (x >= 1950 && y <= 850) return 'mountain';
  if (x >= 1850 && y >= 1450) return 'volcano';
  if (x >= 1350 && x <= 2450 && y >= 550 && y <= 1650) return 'lake';
  if (x <= 1300 && y >= 1500) return 'desert';
  if (x <= 1250 && y <= 850) return 'forest';
  return 'meadow';
}

export function generateInitialBerryBushes(): BerryBush[] {
  const bushes: BerryBush[] = [];
  const count = 48;

  for (let i = 0; i < count; i++) {
    const x = 120 + Math.random() * (WORLD_WIDTH - 240);
    const y = 120 + Math.random() * (WORLD_HEIGHT - 240);
    const biome = getBiomeAt(x, y);

    // Evita el centro del lago profundo
    if (biome === 'lake' && Math.random() < 0.6) continue;

    let berryType: BerryBush['berryType'] = 'oran';
    if (biome === 'forest') berryType = Math.random() > 0.4 ? 'sitrus' : 'lum';
    else if (biome === 'volcano') berryType = 'pecha';
    else if (biome === 'snow') berryType = 'lum';

    bushes.push({
      id: `bush-${i}-${Date.now()}`,
      x,
      y,
      berryType,
      berriesCount: Math.floor(2 + Math.random() * 4),
      maxBerries: 5,
      regrowTimer: 0,
    });
  }
  return bushes;
}

export function generateInitialElementalStones(): ElementalStone[] {
  return [
    { id: 'stone-f1', x: 2500, y: 1900, stoneType: 'fire' },
    { id: 'stone-f2', x: 2200, y: 1750, stoneType: 'fire' },
    { id: 'stone-w1', x: 1900, y: 1100, stoneType: 'water' },
    { id: 'stone-w2', x: 1600, y: 1300, stoneType: 'water' },
    { id: 'stone-t1', x: 2600, y: 400, stoneType: 'thunder' },
    { id: 'stone-t2', x: 800, y: 600, stoneType: 'thunder' },
  ];
}

export interface TerrainDecoration {
  x: number;
  y: number;
  type: 'tree' | 'rock' | 'flower' | 'cactus' | 'lava_bubble' | 'ice_spike' | 'tall_grass';
  variant: number;
}

export function generateDecorations(): TerrainDecoration[] {
  const decor: TerrainDecoration[] = [];
  for (let i = 0; i < 350; i++) {
    const x = 50 + Math.random() * (WORLD_WIDTH - 100);
    const y = 50 + Math.random() * (WORLD_HEIGHT - 100);
    const biome = getBiomeAt(x, y);

    if (biome === 'forest') {
      decor.push({ x, y, type: 'tree', variant: Math.floor(Math.random() * 3) });
    } else if (biome === 'mountain') {
      decor.push({ x, y, type: 'rock', variant: Math.floor(Math.random() * 3) });
    } else if (biome === 'desert') {
      decor.push({ x, y, type: 'cactus', variant: Math.floor(Math.random() * 2) });
    } else if (biome === 'volcano') {
      decor.push({ x, y, type: 'lava_bubble', variant: Math.floor(Math.random() * 2) });
    } else if (biome === 'snow') {
      decor.push({ x, y, type: 'ice_spike', variant: Math.floor(Math.random() * 2) });
    } else if (biome === 'meadow') {
      decor.push({
        x,
        y,
        type: Math.random() > 0.4 ? 'flower' : 'tall_grass',
        variant: Math.floor(Math.random() * 3),
      });
    }
  }
  return decor;
}
