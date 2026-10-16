import { PokemonType } from '../types/pokemon';

// Tabla oficial de multiplicadores de daño según tipos elementales
export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2.0, ice: 2.0, bug: 2.0, rock: 0.5, dragon: 0.5, steel: 2.0 },
  water: { fire: 2.0, water: 0.5, grass: 0.5, ground: 2.0, rock: 2.0, dragon: 0.5 },
  grass: { fire: 0.5, water: 2.0, grass: 0.5, poison: 0.5, ground: 2.0, flying: 0.5, bug: 0.5, rock: 2.0, dragon: 0.5, steel: 0.5 },
  electric: { water: 2.0, grass: 0.5, electric: 0.5, ground: 0, flying: 2.0, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2.0, ice: 0.5, ground: 2.0, flying: 2.0, dragon: 2.0, steel: 0.5 },
  fighting: { normal: 2.0, ice: 2.0, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2.0, ghost: 0, dark: 2.0, steel: 2.0, fairy: 0.5 },
  poison: { grass: 2.0, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2.0 },
  ground: { fire: 2.0, grass: 0.5, electric: 2.0, poison: 2.0, flying: 0, bug: 0.5, rock: 2.0, steel: 2.0 },
  flying: { grass: 2.0, electric: 0.5, fighting: 2.0, bug: 2.0, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2.0, poison: 2.0, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2.0, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2.0, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2.0, ice: 2.0, fighting: 0.5, ground: 0.5, flying: 2.0, bug: 2.0, steel: 0.5 },
  ghost: { normal: 0, psychic: 2.0, ghost: 2.0, dark: 0.5 },
  dragon: { dragon: 2.0, steel: 0.5, fairy: 0 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2.0, rock: 2.0, steel: 0.5, fairy: 2.0 },
  dark: { psychic: 2.0, ghost: 2.0, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  fairy: { fire: 0.5, fighting: 2.0, poison: 0.5, dragon: 2.0, dark: 2.0, steel: 0.5 },
};

export function getTypeEffectiveness(attackType: PokemonType, targetTypes: PokemonType[]): number {
  let multiplier = 1.0;
  for (const t of targetTypes) {
    const chartVal = TYPE_CHART[attackType]?.[t];
    if (chartVal !== undefined) {
      multiplier *= chartVal;
    }
  }
  return multiplier;
}

// Alianzas simbióticas naturales entre tipos:
// Especies con afinidad comparten alimento, forman frentes defensivos y nunca se atacan sin provocación directa
export const SYMBIOTIC_AFFINITIES: [PokemonType, PokemonType][] = [
  ['grass', 'bug'],       // Mutualismo floral: Bicho poliniza y limpia parásitos, Planta ofrece néctar
  ['water', 'ice'],       // Convivencia ártica y delta lacustre
  ['electric', 'flying'], // Patrullaje de cielos y valles
  ['rock', 'ground'],     // Guardianes de cavernas y desfiladeros
  ['fire', 'fighting'],   // Respeto de fortaleza en volcanes
  ['poison', 'ghost'],    // Moradores de sombras
];

export function areTypesSymbiotic(typeA: PokemonType[], typeB: PokemonType[]): boolean {
  for (const a of typeA) {
    for (const b of typeB) {
      if (a === b) return true; // Misma familia elemental
      const match = SYMBIOTIC_AFFINITIES.some(
        ([t1, t2]) => (t1 === a && t2 === b) || (t1 === b && t2 === a)
      );
      if (match) return true;
    }
  }
  return false;
}

export const NATURES: { name: string; trait: string; boost: string; drop: string }[] = [
  { name: 'Firme', trait: 'Orgulloso de su fuerza física', boost: 'Ataque', drop: 'Velocidad' },
  { name: 'Alegre', trait: 'Le encanta corretear y jugar', boost: 'Velocidad', drop: 'Ataque' },
  { name: 'Mansa', trait: 'Pacífico y amigable con otras manadas', boost: 'Defensa', drop: 'Velocidad' },
  { name: 'Valiente', trait: 'Protege a las crías sin dudar', boost: 'Ataque', drop: 'Defensa' },
  { name: 'Tímida', trait: 'Prefiere forrajear en soledad', boost: 'Velocidad', drop: 'Ataque' },
  { name: 'Glotona', trait: 'Siempre busca bayas maduras', boost: 'PS', drop: 'Velocidad' },
  { name: 'Curiosa', trait: 'Explora biomas desconocidos', boost: 'Velocidad', drop: 'Defensa' },
  { name: 'Territorial', trait: 'Vigila celosamente las fronteras', boost: 'Defensa', drop: 'PS' },
];

export const NICKNAMES_PREFIX: string[] = [
  'Gran', 'Feroz', 'Centella', 'Colmillo', 'Brote', 'Zafiro', 'Brasa', 'Brisa',
  'Eco', 'Titán', 'Punta', 'Sombra', 'Rayo', 'Corteza', 'Nube', 'Onda'
];
