export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'steel'
  | 'dark'
  | 'fairy';

export type BiomeType =
  | 'meadow'    // Pradera / Ruta 1
  | 'forest'    // Bosque Viridian
  | 'lake'      // Gran Lago Furia
  | 'volcano'   // Cráter Cinnabar
  | 'mountain'  // Monte Moon
  | 'desert'    // Desierto Ruta 111
  | 'snow';     // Glaciar Helado

export type WeatherType =
  | 'clear'
  | 'rain'
  | 'sunny'
  | 'thunderstorm'
  | 'snow'
  | 'sandstorm';

export type EntityState =
  | 'ROAMING'      // Deambulando por su bioma
  | 'FORAGING'     // Buscando comida / bayas
  | 'HUNTING'      // Acechando presa o rival
  | 'SLEEPING'     // Descansando / durmiendo para recuperar energía
  | 'COURTING'     // Cortejando pareja
  | 'FIGHTING'     // En combate
  | 'FLEEING'      // Huyendo de un rival más fuerte
  | 'EVOLVING';    // En proceso de metamorfosis / evolución

export type PackRole = 'ALPHA' | 'SCOUT' | 'MEMBER' | 'OFFSPRING';

export interface SpeciesInfo {
  id: number;
  name: string;
  types: PokemonType[];
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  preferredBiomes: BiomeType[];
  diet: 'herbivore' | 'carnivore' | 'omnivore';
  evolutionLevel?: number;
  evolvesTo?: number;
  evolutionStone?: 'fire' | 'water' | 'thunder';
  stage: 1 | 2 | 3;
  spriteUrl: string;
  fallbackColor: string;
  description: string;
  cryFreq: number;
}

export interface PokemonEntity {
  id: string;
  speciesId: number;
  nickname: string;
  gender: 'M' | 'F' | 'genderless';
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number; // Radianes de orientación
  scale: number;

  // Estado biológico
  level: number;
  exp: number;
  nextLevelExp: number;
  age: number; // En segundos de vida
  maxAge: number;
  hp: number;
  maxHp: number;
  hunger: number; // 0 (saciado) a 100 (hambruna extrema)
  energy: number; // 100 (alerta) a 0 (agotado)
  happiness: number; // 0 a 100

  // Naturaleza & Genética
  nature: string;
  trait: string;
  ivHp: number;
  ivAttack: number;
  ivDefense: number;
  ivSpeed: number;

  // Comportamiento e IA
  state: EntityState;
  stateTimer: number;
  thought: string;
  emote?: '!' | '?' | '❤️' | '💤' | '⚔️' | '✨' | '💧' | '🔥';
  emoteTimer: number;
  targetEntityId?: string;
  targetPos?: { x: number; y: number };

  // Estructura social
  packId: string | null;
  packRole: PackRole;
  generation: number;
  parents?: [string, string];
  offspringCount: number;
  kills: number;
  battleWins: number;

  // Tiempo de enfriamiento
  attackCooldown: number;
  reproductionCooldown: number;
}

export interface Pack {
  id: string;
  name: string;
  primaryType: PokemonType;
  speciesId: number;
  alphaId: string;
  territoryCenter: { x: number; y: number };
  radius: number;
  color: string;
  alliedPackIds: string[];
}

export interface BerryBush {
  id: string;
  x: number;
  y: number;
  berryType: 'oran' | 'sitrus' | 'pecha' | 'lum';
  berriesCount: number;
  maxBerries: number;
  regrowTimer: number;
}

export interface Nest {
  id: string;
  x: number;
  y: number;
  packId: string;
  eggs: {
    id: string;
    speciesId: number;
    parents: [string, string];
    incubationRemaining: number;
    generation: number;
  }[];
}

export interface ElementalStone {
  id: string;
  x: number;
  y: number;
  stoneType: 'fire' | 'water' | 'thunder';
}

export interface BattleParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  type: 'flame' | 'water' | 'spark' | 'leaf' | 'dust' | 'text';
  text?: string;
  life: number;
  maxLife: number;
  size: number;
}

export interface WorldEvent {
  id: string;
  timestamp: string;
  worldCycle: number;
  type: 'birth' | 'evolution' | 'battle' | 'pack_formed' | 'alpha_challenge' | 'death' | 'extinction_threat' | 'divine';
  icon: string;
  title: string;
  description: string;
  location?: { x: number; y: number };
  entityId?: string;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  targetZoom: number;
  followEntityId: string | null;
  isDragging: boolean;
}
