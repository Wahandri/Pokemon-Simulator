import React from 'react';
import { PokemonEntity } from '../types/pokemon';
import { EcosystemSimulation } from '../simulation/ecosystem';
import { POKEDEX } from '../data/pokedex';
import {
  X,
  Heart,
  Zap,
  Utensils,
  Sparkles,
  Shield,
  Swords,
  Eye,
  Crown,
  Smile,
  Navigation,
} from 'lucide-react';

interface PokedexInspectorProps {
  entity: PokemonEntity | null;
  simulation: EcosystemSimulation;
  onClose: () => void;
  onJumpToParent?: (parentId: string) => void;
  onFollowEntity: (entityId: string) => void;
  isFollowing: boolean;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  normal: { bg: 'bg-[#A8A878]', text: 'text-white' },
  fire: { bg: 'bg-[#F08030]', text: 'text-white' },
  water: { bg: 'bg-[#6890F0]', text: 'text-white' },
  grass: { bg: 'bg-[#78C850]', text: 'text-white' },
  electric: { bg: 'bg-[#F8D030]', text: 'text-slate-900' },
  ice: { bg: 'bg-[#98D8D8]', text: 'text-slate-900' },
  fighting: { bg: 'bg-[#C03028]', text: 'text-white' },
  poison: { bg: 'bg-[#A040A0]', text: 'text-white' },
  ground: { bg: 'bg-[#E0C068]', text: 'text-slate-900' },
  flying: { bg: 'bg-[#A890F0]', text: 'text-white' },
  psychic: { bg: 'bg-[#F85888]', text: 'text-white' },
  bug: { bg: 'bg-[#A8B820]', text: 'text-white' },
  rock: { bg: 'bg-[#B8A038]', text: 'text-white' },
  ghost: { bg: 'bg-[#705898]', text: 'text-white' },
  dragon: { bg: 'bg-[#7038F8]', text: 'text-white' },
  steel: { bg: 'bg-[#B8B8D0]', text: 'text-slate-900' },
  fairy: { bg: 'bg-[#EE99AC]', text: 'text-white' },
};

export const PokedexInspector: React.FC<PokedexInspectorProps> = ({
  entity,
  simulation,
  onClose,
  onJumpToParent,
  onFollowEntity,
  isFollowing,
}) => {
  if (!entity) return null;

  const species = POKEDEX[entity.speciesId] || POKEDEX[1];
  const pack = entity.packId ? simulation.packs.get(entity.packId) : null;
  const hpRatio = Math.max(0, entity.hp / entity.maxHp);

  return (
    <div className="w-80 md:w-96 bg-slate-900 border-2 border-red-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100 select-none animate-in fade-in slide-in-from-right duration-200">
      {/* Cabecera Pokédex Retro Roja */}
      <div className="bg-red-600 px-4 py-3 flex items-center justify-between border-b-2 border-red-800">
        <div className="flex items-center gap-2">
          {/* Lente azul estilo Pokédex */}
          <div className="w-6 h-6 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="font-bold text-xs uppercase tracking-wider text-white ml-1">
            Pokédex Bio-Scan
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-red-200 hover:text-white p-1 rounded hover:bg-red-700 transition-colors"
          title="Cerrar inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[82vh] overflow-y-auto">
        {/* Pantalla de la Criatura */}
        <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 relative overflow-hidden flex flex-col items-center">
          {/* Sprite animado en grande */}
          <div className="w-24 h-24 flex items-center justify-center relative my-1">
            <img
              src={species.spriteUrl}
              alt={species.name}
              className="w-20 h-20 object-contain pixelated relative z-10"
              onError={(e) => {
                // Fallback si no carga el GIF animado
                (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${species.id}.png`;
              }}
            />
            {entity.packRole === 'ALPHA' && (
              <span className="absolute -top-1 -right-1 text-amber-400 text-lg">👑</span>
            )}
          </div>

          <div className="w-full flex items-center justify-between mt-1">
            <div>
              <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                {entity.nickname}
                <span className="text-xs font-normal text-slate-400">
                  {entity.gender === 'M' ? '♂' : entity.gender === 'F' ? '♀' : '⚲'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                N.º {String(species.id).padStart(3, '0')} · {species.name}
              </p>
            </div>
            <div className="text-right">
              <span className="font-bold text-amber-400 text-sm">Nv. {entity.level}</span>
              <p className="text-[10px] text-slate-400">Gen {entity.generation}</p>
            </div>
          </div>

          {/* Tipos elementales */}
          <div className="flex gap-1.5 w-full mt-2">
            {species.types.map((type) => {
              const color = TYPE_COLORS[type] || { bg: 'bg-slate-600', text: 'text-white' };
              return (
                <span
                  key={type}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${color.bg} ${color.text}`}
                >
                  {type}
                </span>
              );
            })}
            {entity.packRole === 'ALPHA' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Crown className="w-2.5 h-2.5" /> Alfa
              </span>
            )}
          </div>
        </div>

        {/* Pensamiento Actual / Estado Mental */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 text-xs">
          <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-1 mb-1">
            <Eye className="w-3 h-3" />
            Estado Interior & Pensamiento
          </div>
          <p className="text-slate-200 italic leading-relaxed text-[11px]">
            "{entity.thought}"
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Naturaleza: <strong className="text-slate-200">{entity.nature}</strong></span>
            <span>Comportamiento: <strong className="text-slate-200">{entity.state}</strong></span>
          </div>
        </div>

        {/* Barras de Estado Vital */}
        <div className="space-y-2.5 text-xs bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
          {/* Salud (PS) */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1 text-slate-300">
                <Heart className="w-3 h-3 text-red-400" /> PS
              </span>
              <span className="font-mono text-slate-200">
                {Math.max(0, Math.round(entity.hp))} / {entity.maxHp}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                style={{ width: `${hpRatio * 100}%` }}
                className={`h-full transition-all duration-300 ${
                  hpRatio > 0.5 ? 'bg-emerald-500' : hpRatio > 0.2 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
          </div>

          {/* Hambre */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1 text-slate-300">
                <Utensils className="w-3 h-3 text-orange-400" /> Hambre
              </span>
              <span className="font-mono text-slate-200">
                {Math.round(entity.hunger)}%
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                style={{ width: `${entity.hunger}%` }}
                className={`h-full transition-all duration-300 ${
                  entity.hunger > 75 ? 'bg-red-500' : entity.hunger > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Energía */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1 text-slate-300">
                <Zap className="w-3 h-3 text-cyan-400" /> Energía
              </span>
              <span className="font-mono text-slate-200">
                {Math.round(entity.energy)}%
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                style={{ width: `${entity.energy}%` }}
                className="h-full bg-cyan-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Experiencia hacia siguiente nivel */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1 text-slate-300">
                <Sparkles className="w-3 h-3 text-purple-400" /> EXP Nivel
              </span>
              <span className="font-mono text-slate-200">
                {entity.exp} / {entity.nextLevelExp}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-700">
              <div
                style={{ width: `${Math.min(100, (entity.exp / entity.nextLevelExp) * 100)}%` }}
                className="h-full bg-purple-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Manada y Sociedad */}
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 text-xs space-y-1.5">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-400" />
            Manada & Alianzas
          </div>
          <p className="text-slate-200 font-medium">
            {pack ? pack.name : 'Vagabundo Solitario'}
          </p>
          {pack && (
            <p className="text-[11px] text-slate-400">
              Rol: <strong className="text-amber-400">{entity.packRole}</strong> · Radio: {pack.radius}px
            </p>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[11px] text-slate-400">
            <span>Descendientes: <strong className="text-slate-200">{entity.offspringCount}</strong></span>
            <span>Victorias: <strong className="text-slate-200">{entity.battleWins}</strong></span>
          </div>
        </div>

        {/* Acciones Divinas Directas */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
            Intervención Divina Directa
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onFollowEntity(entity.id)}
              className={`py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 border transition-colors ${
                isFollowing
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              {isFollowing ? 'Siguiendo' : 'Seguir Cámara'}
            </button>

            <button
              onClick={() => simulation.divineFeed(entity)}
              className="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-emerald-600"
            >
              <Utensils className="w-3.5 h-3.5" />
              Alimentar Baya
            </button>

            {species.evolvesTo && (
              <button
                onClick={() => simulation.divineEvolve(entity)}
                className="col-span-2 py-1.5 px-2 bg-purple-700 hover:bg-purple-600 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-purple-600"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Inducir Evolución Inmediata
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
