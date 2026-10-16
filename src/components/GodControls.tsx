import React, { useState } from 'react';
import { EcosystemSimulation } from '../simulation/ecosystem';
import { WeatherType } from '../types/pokemon';
import { retroAudio } from '../audio/retroAudio';
import {
  Play,
  Pause,
  CloudRain,
  Sun,
  CloudLightning,
  Snowflake,
  Wind,
  Cloud,
  Volume2,
  VolumeX,
  History,
  Zap,
  Egg,
  Sparkles,
  TreeDeciduous,
  ShieldAlert,
} from 'lucide-react';

interface GodControlsProps {
  simulation: EcosystemSimulation;
  timeSpeed: number;
  setTimeSpeed: (s: number) => void;
  dayTimeRatio: number;
  setDayTimeRatio: React.Dispatch<React.SetStateAction<number>>;
  activeTool: string | null;
  setActiveTool: (tool: string | null) => void;
}

export const GodControls: React.FC<GodControlsProps> = ({
  simulation,
  timeSpeed,
  setTimeSpeed,
  dayTimeRatio,
  setDayTimeRatio,
  activeTool,
  setActiveTool,
}) => {
  const [showEvents, setShowEvents] = useState(false);
  const [isMuted, setIsMuted] = useState(retroAudio.getIsMuted());

  const handleToggleMute = () => {
    const muted = retroAudio.toggleMute();
    setIsMuted(muted);
  };

  const weathers: { type: WeatherType; label: string; icon: React.ReactNode }[] = [
    { type: 'clear', label: 'Despejado', icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> },
    { type: 'rain', label: 'Danza Lluvia', icon: <CloudRain className="w-3.5 h-3.5 text-blue-400" /> },
    { type: 'sunny', label: 'Día Soleado', icon: <Sun className="w-3.5 h-3.5 text-orange-400" /> },
    { type: 'thunderstorm', label: 'Tormenta Eléctrica', icon: <CloudLightning className="w-3.5 h-3.5 text-yellow-400" /> },
    { type: 'snow', label: 'Ventisca Helada', icon: <Snowflake className="w-3.5 h-3.5 text-cyan-200" /> },
    { type: 'sandstorm', label: 'Tormenta de Arena', icon: <Wind className="w-3.5 h-3.5 text-amber-600" /> },
  ];

  return (
    <>
      {/* Barra de Comando Superior */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/80 px-4 md:px-6 flex items-center justify-between z-30 select-none shadow-lg">
        {/* Marca / Identidad */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-red-600 border border-red-400 flex items-center justify-center font-bold text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]">
            <span className="font-pixel text-[10px]">PK</span>
          </div>
          <div>
            <h1 className="font-bold text-sm md:text-base text-white tracking-tight flex items-center gap-2">
              PokéGenesis
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Sandbox Observable
              </span>
            </h1>
          </div>
        </div>

        {/* Telemetría del Ecosistema */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-slate-300 font-mono">
          <div>
            <span className="text-slate-400">Población: </span>
            <strong className="text-emerald-400 font-bold">{simulation.entities.length}</strong>
          </div>
          <div>
            <span className="text-slate-400">Manadas: </span>
            <strong className="text-cyan-400 font-bold">{simulation.packs.size}</strong>
          </div>
          <div>
            <span className="text-slate-400">Huevos: </span>
            <strong className="text-amber-400 font-bold">
              {simulation.nests.reduce((acc, n) => acc + n.eggs.length, 0)}
            </strong>
          </div>
          <div>
            <span className="text-slate-400">Gen Máx: </span>
            <strong className="text-purple-400 font-bold">Gen {simulation.maxGeneration}</strong>
          </div>
          <div>
            <span className="text-slate-400">Tiempo: </span>
            <strong className="text-slate-200">{Math.floor(simulation.worldCycle)}s</strong>
          </div>
        </div>

        {/* Controles de Simulación (Play/Pause, Velocidad, Audio, Bitácora) */}
        <div className="flex items-center gap-2">
          {/* Velocidades */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setTimeSpeed(timeSpeed === 0 ? 1 : 0)}
              className={`p-1.5 rounded transition-colors ${
                timeSpeed === 0 ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
              title={timeSpeed === 0 ? 'Reanudar Simulación' : 'Pausar Simulación'}
            >
              {timeSpeed === 0 ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setTimeSpeed(speed)}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                  timeSpeed === speed ? 'bg-slate-700 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Sonido retro */}
          <button
            onClick={handleToggleMute}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title={isMuted ? 'Activar Sonidos' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Botón Bitácora */}
          <button
            onClick={() => setShowEvents(!showEvents)}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium ${
              showEvents
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Ver Bitácora de Eventos"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Bitácora</span>
          </button>
        </div>
      </header>

      {/* Dock Inferior de Poderes Divinos & Clima */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col md:flex-row items-center gap-2 max-w-[95vw]">
        {/* Selector de Clima Continental */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 flex items-center gap-1 shadow-2xl">
          {weathers.map((w) => (
            <button
              key={w.type}
              onClick={() => {
                simulation.weather = w.type;
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                simulation.weather === w.type
                  ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title={`Invocar clima: ${w.label}`}
            >
              {w.icon}
              <span className="hidden sm:inline">{w.label}</span>
            </button>
          ))}
        </div>

        {/* Herramientas de Intervención Divina */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 flex items-center gap-1 shadow-2xl">
          <button
            onClick={() => setActiveTool(activeTool === 'berry' ? null : 'berry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTool === 'berry'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title="Haz clic en cualquier punto del mapa para plantar un arbusto de bayas"
          >
            <TreeDeciduous className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sembrar Bayas</span>
          </button>

          <button
            onClick={() => setActiveTool(activeTool === 'thunder' ? null : 'thunder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTool === 'thunder'
                ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title="Haz clic para impactar con un rayo divino intimidatorio"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rayo Castigo</span>
          </button>

          <button
            onClick={() => setActiveTool(activeTool === 'egg' ? null : 'egg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTool === 'egg'
                ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title="Haz clic en el mapa para colocar un nido de cría"
          >
            <Egg className="w-3.5 h-3.5 text-amber-400" />
            <span>Nido de Huevo</span>
          </button>

          <button
            onClick={() => {
              simulation.spawnRareLegendary(151, 1600, 1200);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-md transition-all"
            title="Invocar al mítico Mew en el centro del continente"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-200" />
            <span className="hidden sm:inline">Invocar Mew</span>
          </button>
        </div>
      </div>

      {/* Indicador de Herramienta Divina Activa */}
      {activeTool && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce select-none">
          <ShieldAlert className="w-4 h-4" />
          <span>Haz clic en el mapa para usar: {activeTool.toUpperCase()} (Pulsa de nuevo para cancelar)</span>
        </div>
      )}

      {/* Modal / Panel Desplegable de Bitácora de Eventos */}
      {showEvents && (
        <div className="fixed top-16 right-4 w-80 md:w-96 max-h-[70vh] bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl z-30 flex flex-col overflow-hidden text-slate-200 animate-in fade-in duration-150">
          <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <History className="w-4 h-4" /> Bitácora de Eventos del Mundo
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              {simulation.events.length} registros
            </span>
          </div>

          <div className="p-3 space-y-2 overflow-y-auto flex-1 text-xs">
            {simulation.events.map((ev) => (
              <div
                key={ev.id}
                className="p-2 rounded bg-slate-950/60 border border-slate-800 space-y-0.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <span>{ev.icon}</span> {ev.title}
                  </span>
                  <span className="font-mono">{ev.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {ev.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
