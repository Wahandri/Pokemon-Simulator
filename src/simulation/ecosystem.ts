import {
  PokemonEntity,
  Pack,
  BerryBush,
  Nest,
  ElementalStone,
  BattleParticle,
  WorldEvent,
  WeatherType,
  PokemonType,
} from '../types/pokemon';
import { POKEDEX } from '../data/pokedex';
import {
  getTypeEffectiveness,
  SYMBIOTIC_AFFINITIES,
  NATURES,
  NICKNAMES_PREFIX,
} from '../data/typeEffectiveness';
import { WORLD_WIDTH, WORLD_HEIGHT, getBiomeAt } from './world';
import { retroAudio } from '../audio/retroAudio';

export class EcosystemSimulation {
  public entities: PokemonEntity[] = [];
  public packs: Map<string, Pack> = new Map();
  public bushes: BerryBush[] = [];
  public nests: Nest[] = [];
  public stones: ElementalStone[] = [];
  public particles: BattleParticle[] = [];
  public events: WorldEvent[] = [];
  public weather: WeatherType = 'clear';
  public worldCycle: number = 0; // Segundos transcurridos en el mundo
  public maxGeneration: number = 1;

  constructor(initialBushes: BerryBush[], initialStones: ElementalStone[]) {
    this.bushes = initialBushes;
    this.stones = initialStones;
    this.spawnGenesisPopulation();
  }

  // --- Creación de Población Inicial de Génesis ---
  public spawnGenesisPopulation() {
    this.entities = [];
    this.packs.clear();
    this.nests = [];

    // Poblaciones iniciales por bioma
    const initialConfig: { speciesId: number; count: number; x: number; y: number }[] = [
      // Bosque & Pradera
      { speciesId: 1, count: 6, x: 600, y: 700 },   // Bulbasaur
      { speciesId: 10, count: 8, x: 450, y: 400 },  // Caterpie
      { speciesId: 12, count: 4, x: 700, y: 450 },  // Butterfree
      { speciesId: 16, count: 8, x: 900, y: 900 },  // Pidgey
      { speciesId: 25, count: 5, x: 500, y: 1100 }, // Pikachu
      { speciesId: 133, count: 4, x: 800, y: 1200 },// Eevee
      { speciesId: 143, count: 2, x: 1050, y: 650 },// Snorlax

      // Gran Lago
      { speciesId: 7, count: 7, x: 1900, y: 1100 }, // Squirtle
      { speciesId: 129, count: 9, x: 1750, y: 950 },// Magikarp
      { speciesId: 131, count: 3, x: 2100, y: 1250 },// Lapras

      // Volcán Cinnabar
      { speciesId: 4, count: 7, x: 2500, y: 1950 }, // Charmander

      // Montaña Moon
      { speciesId: 74, count: 6, x: 2550, y: 500 }, // Geodude

      // Dios del Ecosistema
      { speciesId: 151, count: 1, x: 1600, y: 1200 }, // Mew
    ];

    let entityCounter = 1;
    for (const group of initialConfig) {
      for (let i = 0; i < group.count; i++) {
        const jitterX = group.x + (Math.random() - 0.5) * 450;
        const jitterY = group.y + (Math.random() - 0.5) * 450;
        const boundedX = Math.max(100, Math.min(WORLD_WIDTH - 100, jitterX));
        const boundedY = Math.max(100, Math.min(WORLD_HEIGHT - 100, jitterY));

        const entity = this.createPokemon(group.speciesId, boundedX, boundedY, 1, undefined, entityCounter++);
        this.entities.push(entity);
      }
    }

    this.recalculatePacks();
    this.addEvent({
      type: 'birth',
      icon: '🌱',
      title: 'Creación de PokéGenesis',
      description: `El ecosistema se ha originado con ${this.entities.length} criaturas vivas en 7 biomas contiguos.`,
    });
  }

  public createPokemon(
    speciesId: number,
    x: number,
    y: number,
    generation: number = 1,
    parents?: [string, string],
    index: number = 1
  ): PokemonEntity {
    const info = POKEDEX[speciesId] || POKEDEX[1];
    const nature = NATURES[Math.floor(Math.random() * NATURES.length)];
    const prefix = NICKNAMES_PREFIX[Math.floor(Math.random() * NICKNAMES_PREFIX.length)];
    const nickname = `${prefix} ${info.name}`;
    const gender = Math.random() > 0.5 ? 'M' : 'F';

    const baseLevel = generation === 1 ? Math.floor(4 + Math.random() * 8) : 1;
    const maxHp = Math.floor(info.baseHp * (1 + baseLevel * 0.12));

    return {
      id: `poke-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`,
      speciesId,
      nickname,
      gender: speciesId === 151 ? 'genderless' : gender,
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      heading: Math.random() * Math.PI * 2,
      scale: info.stage === 1 ? 0.9 : info.stage === 2 ? 1.15 : 1.4,

      level: baseLevel,
      exp: 0,
      nextLevelExp: baseLevel * 25,
      age: 0,
      maxAge: 3600 + Math.random() * 1800, // Ciclo de vida prolongado
      hp: maxHp,
      maxHp,
      hunger: Math.floor(Math.random() * 40),
      energy: Math.floor(70 + Math.random() * 30),
      happiness: Math.floor(50 + Math.random() * 30),

      nature: nature.name,
      trait: nature.trait,
      ivHp: Math.floor(Math.random() * 32),
      ivAttack: Math.floor(Math.random() * 32),
      ivDefense: Math.floor(Math.random() * 32),
      ivSpeed: Math.floor(Math.random() * 32),

      state: 'ROAMING',
      stateTimer: 3 + Math.random() * 4,
      thought: 'Explorando su territorio en busca de aromas familiares.',
      emote: undefined,
      emoteTimer: 0,

      packId: null,
      packRole: 'MEMBER',
      generation,
      parents,
      offspringCount: 0,
      kills: 0,
      battleWins: 0,

      attackCooldown: 0,
      reproductionCooldown: 60 + Math.random() * 60,
    };
  }

  // --- Recalcular Jerarquía de Manadas y Alianzas ---
  public recalculatePacks() {
    this.packs.clear();

    // Agrupación por especie y proximidad
    const speciesGroups = new Map<number, PokemonEntity[]>();
    for (const e of this.entities) {
      if (!speciesGroups.has(e.speciesId)) {
        speciesGroups.set(e.speciesId, []);
      }
      speciesGroups.get(e.speciesId)!.push(e);
    }

    speciesGroups.forEach((members, speciesId) => {
      if (members.length === 0) return;
      const info = POKEDEX[speciesId];
      if (!info) return;

      // Ordenar por nivel descendente: el de mayor nivel es el Alfa
      members.sort((a, b) => b.level - a.level || b.age - a.age);
      const alpha = members[0];
      const packId = `pack-${speciesId}-${alpha.id.slice(-4)}`;

      // Centro de territorio promedio
      let sumX = 0;
      let sumY = 0;
      members.forEach((m) => {
        sumX += m.x;
        sumY += m.y;
      });

      const pack: Pack = {
        id: packId,
        name: `Clan ${info.name}`,
        primaryType: info.types[0],
        speciesId,
        alphaId: alpha.id,
        territoryCenter: { x: sumX / members.length, y: sumY / members.length },
        radius: 350 + members.length * 35,
        color: info.fallbackColor,
        alliedPackIds: [],
      };

      this.packs.set(packId, pack);

      members.forEach((m) => {
        m.packId = packId;
        if (m.id === alpha.id) {
          m.packRole = 'ALPHA';
        } else if (m.level < 4) {
          m.packRole = 'OFFSPRING';
        } else if (Math.random() < 0.25) {
          m.packRole = 'SCOUT';
        } else {
          m.packRole = 'MEMBER';
        }
      });
    });

    // Detectar Alianzas Simbióticas naturales entre manadas
    this.packs.forEach((packA) => {
      this.packs.forEach((packB) => {
        if (packA.id === packB.id) return;
        const isSymbiotic = SYMBIOTIC_AFFINITIES.some(
          ([t1, t2]) =>
            (t1 === packA.primaryType && t2 === packB.primaryType) ||
            (t1 === packB.primaryType && t2 === packA.primaryType)
        );
        if (isSymbiotic && !packA.alliedPackIds.includes(packB.id)) {
          packA.alliedPackIds.push(packB.id);
        }
      });
    });
  }

  // --- Actualización de Bucle Principal (Tick) ---
  public update(dt: number) {
    this.worldCycle += dt;

    // Actualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Regenerar bayas
    for (const bush of this.bushes) {
      if (bush.berriesCount < bush.maxBerries) {
        bush.regrowTimer += dt;
        const regrowRate = this.weather === 'rain' ? 12 : 24;
        if (bush.regrowTimer >= regrowRate) {
          bush.berriesCount++;
          bush.regrowTimer = 0;
        }
      }
    }

    // Actualizar nidos e incubación
    for (const nest of this.nests) {
      for (let i = nest.eggs.length - 1; i >= 0; i--) {
        const egg = nest.eggs[i];
        egg.incubationRemaining -= dt;
        if (egg.incubationRemaining <= 0) {
          // ¡Eclosión!
          const baby = this.createPokemon(
            egg.speciesId,
            nest.x + (Math.random() - 0.5) * 40,
            nest.y + (Math.random() - 0.5) * 40,
            egg.generation,
            egg.parents
          );
          baby.emote = '✨';
          baby.emoteTimer = 3;
          baby.thought = '¡Acaba de nacer! Da sus primeros pasos en el mundo.';
          this.entities.push(baby);

          if (baby.generation > this.maxGeneration) {
            this.maxGeneration = baby.generation;
          }

          retroAudio.playEggHatch();

          const species = POKEDEX[egg.speciesId];
          this.addEvent({
            type: 'birth',
            icon: '🥚',
            title: `Eclosión de ${species.name}`,
            description: `Ha nacido una cría de ${species.name} (Generación ${baby.generation}) en el nido.`,
            location: { x: nest.x, y: nest.y },
            entityId: baby.id,
          });

          nest.eggs.splice(i, 1);
        }
      }
    }

    // Actualizar cada entidad Pokémon
    const deadEntities: string[] = [];

    for (const entity of this.entities) {
      this.updateEntity(entity, dt, deadEntities);
    }

    // Limpiar fallecidos
    if (deadEntities.length > 0) {
      this.entities = this.entities.filter((e) => !deadEntities.includes(e.id));
      this.recalculatePacks();
    }

    // Chequeo periódico de manadas
    if (Math.floor(this.worldCycle) % 15 === 0 && Math.random() < 0.05) {
      this.recalculatePacks();
    }
  }

  private updateEntity(entity: PokemonEntity, dt: number, deadList: string[]) {
    const info = POKEDEX[entity.speciesId];
    if (!info) return;

    // Envejecimiento & metabolismo
    entity.age += dt;
    entity.hunger = Math.min(100, entity.hunger + dt * 0.45);
    entity.energy = Math.max(0, entity.energy - dt * 0.35);

    if (entity.attackCooldown > 0) entity.attackCooldown -= dt;
    if (entity.reproductionCooldown > 0) entity.reproductionCooldown -= dt;
    if (entity.emoteTimer > 0) {
      entity.emoteTimer -= dt;
      if (entity.emoteTimer <= 0) entity.emote = undefined;
    }

    // Efecto de clima
    if (this.weather === 'rain' && info.types.includes('water')) {
      entity.energy = Math.min(100, entity.energy + dt * 0.5);
    } else if (this.weather === 'sunny' && info.types.includes('fire')) {
      entity.energy = Math.min(100, entity.energy + dt * 0.5);
    } else if (this.weather === 'snow' && !info.types.includes('ice') && !info.types.includes('fire')) {
      entity.energy = Math.max(0, entity.energy - dt * 0.2);
    }

    // Hambruna crítica
    if (entity.hunger >= 95) {
      entity.hp -= dt * 3.5;
      entity.emote = '💧';
      entity.emoteTimer = 1;
      entity.thought = '¡Debilitándose por inanición! Necesita alimento urgente.';
      if (entity.hp <= 0) {
        deadList.push(entity.id);
        this.addEvent({
          type: 'death',
          icon: '💀',
          title: `${entity.nickname} se ha desvanecido`,
          description: `No pudo encontrar sustento en su hábitat y sucumbió.`,
          location: { x: entity.x, y: entity.y },
        });
        return;
      }
    }

    // Máquina de estados de IA
    this.runAIStateMachine(entity, dt);

    // Integración física de posición
    entity.x += entity.vx * dt * 60;
    entity.y += entity.vy * dt * 60;

    // Fricción
    entity.vx *= 0.94;
    entity.vy *= 0.94;

    // Límites de mapa con rebote suave
    if (entity.x < 100) { entity.x = 100; entity.vx = Math.abs(entity.vx); }
    if (entity.x > WORLD_WIDTH - 100) { entity.x = WORLD_WIDTH - 100; entity.vx = -Math.abs(entity.vx); }
    if (entity.y < 100) { entity.y = 100; entity.vy = Math.abs(entity.vy); }
    if (entity.y > WORLD_HEIGHT - 100) { entity.y = WORLD_HEIGHT - 100; entity.vy = -Math.abs(entity.vy); }

    // Orientación
    if (Math.abs(entity.vx) > 0.05 || Math.abs(entity.vy) > 0.05) {
      entity.heading = Math.atan2(entity.vy, entity.vx);
    }

    // Comprobación de evolución natural por nivel
    if (info.evolutionLevel && entity.level >= info.evolutionLevel && info.evolvesTo) {
      this.evolveEntity(entity, info.evolvesTo);
    }
  }

  private runAIStateMachine(entity: PokemonEntity, dt: number) {
    const info = POKEDEX[entity.speciesId];
    if (!info) return;

    // Transiciones de estado por prioridades vitales
    if (entity.state !== 'FIGHTING' && entity.state !== 'EVOLVING') {
      if (entity.energy < 20 && entity.state !== 'SLEEPING') {
        entity.state = 'SLEEPING';
        entity.emote = '💤';
        entity.emoteTimer = 4;
        entity.thought = 'Agotado. Cierra los ojos para reponer fuerzas.';
      } else if (entity.hunger > 55 && entity.state !== 'FORAGING' && entity.state !== 'HUNTING') {
        entity.state = 'FORAGING';
        entity.emote = '!';
        entity.emoteTimer = 2;
        entity.thought = 'El apetito aprieta. Rastrea arbustos de bayas.';
      } else if (entity.reproductionCooldown <= 0 && entity.hunger < 35 && entity.energy > 70 && entity.level >= 5) {
        if (entity.state !== 'COURTING') {
          entity.state = 'COURTING';
          entity.emote = '❤️';
          entity.emoteTimer = 3;
          entity.thought = 'En época de celo. Busca una pareja compatible.';
        }
      }
    }

    // Ejecución de comportamiento
    switch (entity.state) {
      case 'SLEEPING': {
        entity.energy = Math.min(100, entity.energy + dt * 7);
        entity.hp = Math.min(entity.maxHp, entity.hp + dt * 2.5);
        if (Math.random() < 0.04) {
          entity.emote = '💤';
          entity.emoteTimer = 2;
        }
        if (entity.energy >= 95) {
          entity.state = 'ROAMING';
          entity.emote = '✨';
          entity.emoteTimer = 2;
          entity.thought = 'Despertó lleno de energía y listo para un nuevo día.';
        }
        break;
      }

      case 'FORAGING': {
        // Encontrar el arbusto de bayas más cercano con frutos
        let nearestBush: BerryBush | null = null;
        let minDist = Infinity;

        for (const bush of this.bushes) {
          if (bush.berriesCount > 0) {
            const dist = Math.hypot(bush.x - entity.x, bush.y - entity.y);
            if (dist < minDist) {
              minDist = dist;
              nearestBush = bush;
            }
          }
        }

        if (nearestBush && minDist < 600) {
          const angle = Math.atan2(nearestBush.y - entity.y, nearestBush.x - entity.x);
          const speed = 1.6;
          entity.vx += Math.cos(angle) * speed * 0.15;
          entity.vy += Math.sin(angle) * speed * 0.15;
          entity.thought = `Aproximándose a un arbusto de baya ${nearestBush.berryType.toUpperCase()}.`;

          // Comer
          if (minDist < 35) {
            nearestBush.berriesCount--;
            entity.hunger = Math.max(0, entity.hunger - 45);
            entity.hp = Math.min(entity.maxHp, entity.hp + 20);
            entity.exp += 8;
            entity.emote = '❤️';
            entity.emoteTimer = 2.5;
            entity.thought = '¡Disfrutó de una deliciosa baya y sació su hambre!';
            if (entity.hunger < 25) {
              entity.state = 'ROAMING';
            }
          }
        } else {
          // Deambular buscando
          this.applyWandering(entity, 1.2);
          entity.thought = 'Olfateando el viento buscando arbustos de frutos.';
        }
        break;
      }

      case 'COURTING': {
        // Buscar pareja de la misma especie
        let partner: PokemonEntity | null = null;
        let minDist = Infinity;

        for (const other of this.entities) {
          if (
            other.id !== entity.id &&
            other.speciesId === entity.speciesId &&
            other.gender !== entity.gender &&
            other.state === 'COURTING'
          ) {
            const dist = Math.hypot(other.x - entity.x, other.y - entity.y);
            if (dist < minDist) {
              minDist = dist;
              partner = other;
            }
          }
        }

        if (partner && minDist < 400) {
          const angle = Math.atan2(partner.y - entity.y, partner.x - entity.x);
          entity.vx += Math.cos(angle) * 0.18;
          entity.vy += Math.sin(angle) * 0.18;
          entity.thought = `Danzando en cortejo con ${partner.nickname}.`;

          if (minDist < 40) {
            // Fecundación y nido
            this.layEgg(entity, partner);
            entity.reproductionCooldown = 150;
            partner.reproductionCooldown = 150;
            entity.state = 'ROAMING';
            partner.state = 'ROAMING';
            entity.emote = '❤️';
            partner.emote = '❤️';
            entity.emoteTimer = 3;
            partner.emoteTimer = 3;
            entity.offspringCount++;
            partner.offspringCount++;
          }
        } else {
          this.applyWandering(entity, 1.0);
        }
        break;
      }

      case 'FIGHTING': {
        // Resolver combate si tiene objetivo
        if (entity.targetEntityId) {
          const target = this.entities.find((e) => e.id === entity.targetEntityId);
          if (target && target.hp > 0) {
            const dist = Math.hypot(target.x - entity.x, target.y - entity.y);
            if (dist < 450) {
              const angle = Math.atan2(target.y - entity.y, target.x - entity.x);
              entity.vx += Math.cos(angle) * 0.25;
              entity.vy += Math.sin(angle) * 0.25;

              if (dist < 50 && entity.attackCooldown <= 0) {
                this.executeAttack(entity, target);
                entity.attackCooldown = 1.2;
              }
            } else {
              entity.state = 'ROAMING';
              entity.targetEntityId = undefined;
            }
          } else {
            entity.state = 'ROAMING';
            entity.targetEntityId = undefined;
          }
        } else {
          entity.state = 'ROAMING';
        }
        break;
      }

      case 'FLEEING': {
        this.applyWandering(entity, 2.2);
        entity.thought = '¡Huyendo a toda prisa para salvar la vida!';
        if (Math.random() < 0.05) {
          entity.state = 'ROAMING';
        }
        break;
      }

      case 'ROAMING':
      default: {
        // Buscar rivales territoriales cercanos si es un Pokémon territorial o Alfa
        if (entity.packRole === 'ALPHA' && Math.random() < 0.03) {
          const rival = this.entities.find(
            (other) =>
              other.id !== entity.id &&
              other.packId !== entity.packId &&
              Math.hypot(other.x - entity.x, other.y - entity.y) < 180
          );
          if (rival) {
            const myPack = entity.packId ? this.packs.get(entity.packId) : null;
            const isAllied = myPack?.alliedPackIds.includes(rival.packId || '');
            if (!isAllied) {
              entity.state = 'FIGHTING';
              entity.targetEntityId = rival.id;
              entity.emote = '⚔️';
              entity.emoteTimer = 2;
              entity.thought = `¡Defendiendo territorio contra el invasor ${rival.nickname}!`;
              return;
            }
          }
        }

        // Seguir al Alfa si pertenece a una manada
        if (entity.packRole !== 'ALPHA' && entity.packId) {
          const pack = this.packs.get(entity.packId);
          const alpha = this.entities.find((e) => e.id === pack?.alphaId);
          if (alpha) {
            const distToAlpha = Math.hypot(alpha.x - entity.x, alpha.y - entity.y);
            if (distToAlpha > 180) {
              const angle = Math.atan2(alpha.y - entity.y, alpha.x - entity.x);
              entity.vx += Math.cos(angle) * 0.12;
              entity.vy += Math.sin(angle) * 0.12;
              entity.thought = `Siguiendo los pasos del Alfa ${alpha.nickname}.`;
              return;
            }
          }
        }

        this.applyWandering(entity, 0.9);
        entity.thought = 'Patrullando plácidamente su hábitat natural.';
        break;
      }
    }
  }

  private applyWandering(entity: PokemonEntity, speedMultiplier: number = 1.0) {
    // Ruido suave para cambio de rumbo
    entity.heading += (Math.random() - 0.5) * 0.35;
    const speed = 0.8 * speedMultiplier;
    entity.vx += Math.cos(entity.heading) * speed * 0.15;
    entity.vy += Math.sin(entity.heading) * speed * 0.15;
  }

  // --- Ejecución de Combate ---
  public executeAttack(attacker: PokemonEntity, defender: PokemonEntity) {
    const atkInfo = POKEDEX[attacker.speciesId];
    const defInfo = POKEDEX[defender.speciesId];
    if (!atkInfo || !defInfo) return;

    const atkType = atkInfo.types[0];
    const multiplier = getTypeEffectiveness(atkType, defInfo.types);

    const baseDmg = Math.max(3, (attacker.level * 2.2 + attacker.ivAttack * 0.3) - (defender.ivDefense * 0.2));
    const finalDmg = Math.floor(baseDmg * multiplier);

    defender.hp -= finalDmg;
    attacker.exp += Math.floor(finalDmg * 0.6);

    retroAudio.playAttackHit();

    // Partículas de combate
    this.spawnCombatParticles(defender.x, defender.y, atkType, finalDmg, multiplier);

    if (multiplier >= 2.0) {
      attacker.thought = `¡Ataque súper eficaz contra ${defender.nickname}!`;
      defender.emote = '!';
    } else {
      attacker.thought = `Golpeó a ${defender.nickname} con fuerza.`;
    }

    // Contraataque o Huida
    if (defender.hp <= defender.maxHp * 0.25) {
      defender.state = 'FLEEING';
      defender.emote = '💧';
      defender.emoteTimer = 3;
      defender.thought = '¡Gravemente herido! Intenta escapar.';
    } else if (defender.state !== 'FIGHTING') {
      defender.state = 'FIGHTING';
      defender.targetEntityId = attacker.id;
      defender.emote = '⚔️';
      defender.emoteTimer = 2;
    }

    // Victoria
    if (defender.hp <= 0) {
      attacker.kills++;
      attacker.battleWins++;
      attacker.exp += 35;
      attacker.happiness = Math.min(100, attacker.happiness + 15);
      attacker.emote = '✨';
      attacker.emoteTimer = 3;
      attacker.thought = `¡Triunfó en combate sobre ${defender.nickname}!`;

      this.addEvent({
        type: 'battle',
        icon: '⚔️',
        title: `Victoria de ${attacker.nickname}`,
        description: `Derrotó a ${defender.nickname} en una disputa territorial salvaje.`,
        location: { x: defender.x, y: defender.y },
      });
    }
  }

  private spawnCombatParticles(
    x: number,
    y: number,
    type: PokemonType,
    damage: number,
    multiplier: number
  ) {
    let color = '#FFCC00';
    let pType: BattleParticle['type'] = 'spark';

    if (type === 'fire') { color = '#FF4500'; pType = 'flame'; }
    else if (type === 'water') { color = '#1E90FF'; pType = 'water'; }
    else if (type === 'grass') { color = '#32CD32'; pType = 'leaf'; }
    else if (type === 'electric') { color = '#FFD700'; pType = 'spark'; }

    for (let i = 0; i < 5; i++) {
      this.particles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        color,
        type: pType,
        life: 0.45,
        maxLife: 0.45,
        size: 3 + Math.random() * 4,
      });
    }

    // Texto de daño flotante
    const textDesc = multiplier >= 2.0 ? `-${damage} ¡Súper Eficaz!` : `-${damage}`;
    this.particles.push({
      id: `pt-${Date.now()}-${Math.random()}`,
      x,
      y: y - 20,
      vx: 0,
      vy: -0.8,
      color: multiplier >= 2.0 ? '#FF3333' : '#FFFFFF',
      type: 'text',
      text: textDesc,
      life: 0.8,
      maxLife: 0.8,
      size: 11,
    });
  }

  // --- Nidos y Reproducción ---
  private layEgg(parentA: PokemonEntity, parentB: PokemonEntity) {
    const nextGen = Math.max(parentA.generation, parentB.generation) + 1;
    let nest = this.nests.find(
      (n) => Math.hypot(n.x - parentA.x, n.y - parentA.y) < 150
    );

    if (!nest) {
      nest = {
        id: `nest-${Date.now()}`,
        x: parentA.x,
        y: parentA.y,
        packId: parentA.packId || 'wild',
        eggs: [],
      };
      this.nests.push(nest);
    }

    nest.eggs.push({
      id: `egg-${Date.now()}-${Math.random()}`,
      speciesId: parentA.speciesId, // Cría de la misma especie
      parents: [parentA.id, parentB.id],
      incubationRemaining: 18, // 18 segundos de incubación
      generation: nextGen,
    });

    const info = POKEDEX[parentA.speciesId];
    this.addEvent({
      type: 'birth',
      icon: '🥚',
      title: `Nuevo nido de ${info.name}`,
      description: `${parentA.nickname} y ${parentB.nickname} han depositado un huevo de la Generación ${nextGen}.`,
      location: { x: parentA.x, y: parentA.y },
    });
  }

  // --- Evolución ---
  public evolveEntity(entity: PokemonEntity, targetSpeciesId: number) {
    const prevInfo = POKEDEX[entity.speciesId];
    const newInfo = POKEDEX[targetSpeciesId];
    if (!newInfo) return;

    entity.speciesId = targetSpeciesId;
    entity.nickname = `${entity.nickname.split(' ')[0]} ${newInfo.name}`;
    entity.maxHp = Math.floor(newInfo.baseHp * (1 + entity.level * 0.15));
    entity.hp = entity.maxHp;
    entity.scale = newInfo.stage === 2 ? 1.2 : 1.45;
    entity.state = 'EVOLVING';
    entity.emote = '✨';
    entity.emoteTimer = 4;
    entity.thought = `¡Está evolucionando en un majestuoso ${newInfo.name}!`;

    retroAudio.playEvolution();

    // Partículas de evolución
    for (let i = 0; i < 18; i++) {
      this.particles.push({
        id: `pe-${Date.now()}-${i}`,
        x: entity.x,
        y: entity.y,
        vx: Math.cos((i / 18) * Math.PI * 2) * 2.5,
        vy: Math.sin((i / 18) * Math.PI * 2) * 2.5,
        color: '#FFEA00',
        type: 'spark',
        life: 1.0,
        maxLife: 1.0,
        size: 5,
      });
    }

    setTimeout(() => {
      entity.state = 'ROAMING';
    }, 2500);

    this.addEvent({
      type: 'evolution',
      icon: '✨',
      title: `¡Evolución! ${prevInfo.name} -> ${newInfo.name}`,
      description: `${entity.nickname} ha completado su metamorfosis natural en el ecosistema.`,
      location: { x: entity.x, y: entity.y },
      entityId: entity.id,
    });

    this.recalculatePacks();
  }

  // --- Herramientas Divinas del Usuario ---
  public divineFeed(entity: PokemonEntity) {
    entity.hunger = 0;
    entity.hp = entity.maxHp;
    entity.energy = 100;
    entity.happiness = 100;
    entity.emote = '❤️';
    entity.emoteTimer = 3;
    entity.thought = '¡Ha recibido la bendición de alimento divino! Se siente revitalizado.';
  }

  public divineEvolve(entity: PokemonEntity) {
    const info = POKEDEX[entity.speciesId];
    if (info?.evolvesTo) {
      this.evolveEntity(entity, info.evolvesTo);
    }
  }

  public divineStrike(x: number, y: number) {
    retroAudio.playThunder();

    // Dañar o intimidar criaturas en el radio
    for (const entity of this.entities) {
      const dist = Math.hypot(entity.x - x, entity.y - y);
      if (dist < 180) {
        entity.hp -= 25;
        entity.state = 'FLEEING';
        entity.emote = '!';
        entity.emoteTimer = 3;
        entity.thought = '¡El cielo rugió con un rayo castigador! Huye asustado.';
      }
    }

    // Partículas de rayo
    for (let i = 0; i < 16; i++) {
      this.particles.push({
        id: `th-${Date.now()}-${i}`,
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: '#00FFFF',
        type: 'spark',
        life: 0.6,
        maxLife: 0.6,
        size: 6,
      });
    }

    this.addEvent({
      type: 'divine',
      icon: '⚡',
      title: 'Rayo Divino Desatado',
      description: `Un relámpago celestial cayó sacudiendo la tierra e intimidando a los Pokémon cercanos.`,
      location: { x, y },
    });
  }

  public spawnRareLegendary(speciesId: number, x: number, y: number) {
    const legend = this.createPokemon(speciesId, x, y, 1);
    legend.level = 50;
    legend.maxHp = 350;
    legend.hp = 350;
    legend.emote = '✨';
    legend.emoteTimer = 4;
    legend.thought = 'Un Pokémon legendario desciende con solemnidad sobre el continente.';
    this.entities.push(legend);

    const info = POKEDEX[speciesId];
    this.addEvent({
      type: 'divine',
      icon: '🌟',
      title: `Aparición de ${info.name}`,
      description: `Un legendario ${info.name} ha hecho su entrada en el ecosistema.`,
      location: { x, y },
      entityId: legend.id,
    });
  }

  public addEvent(ev: Omit<WorldEvent, 'id' | 'timestamp' | 'worldCycle'>) {
    const newEvent: WorldEvent = {
      ...ev,
      id: `ev-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      worldCycle: Math.floor(this.worldCycle),
    };
    this.events.unshift(newEvent);
    if (this.events.length > 50) {
      this.events.pop();
    }
  }
}
