import React, { useRef } from 'react';
import { CameraState } from '../types/pokemon';
import { EcosystemSimulation } from '../simulation/ecosystem';
import { WORLD_WIDTH, WORLD_HEIGHT, BIOMES } from '../simulation/world';
import { POKEDEX } from '../data/pokedex';
import { Compass, ZoomIn, ZoomOut, Maximize2, Crosshair } from 'lucide-react';

interface MinimapProps {
  simulation: EcosystemSimulation;
  camera: CameraState;
  setCamera: React.Dispatch<React.SetStateAction<CameraState>>;
  onCenterAlpha: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  simulation,
  camera,
  setCamera,
  onCenterAlpha,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const miniW = 200;
  const miniH = 150;
  const scaleX = miniW / WORLD_WIDTH;
  const scaleY = miniH / WORLD_HEIGHT;

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetWorldX = clickX / scaleX;
    const targetWorldY = clickY / scaleY;

    setCamera((prev) => ({
      ...prev,
      x: Math.max(100, Math.min(WORLD_WIDTH - 100, targetWorldX)),
      y: Math.max(100, Math.min(WORLD_HEIGHT - 100, targetWorldY)),
      followEntityId: null,
    }));
  };

  // Dimensiones del recuadro del visor de la cámara en el minimapa
  const viewportW = Math.min(miniW, (window.innerWidth / camera.zoom) * scaleX);
  const viewportH = Math.min(miniH, (window.innerHeight / camera.zoom) * scaleY);
  const viewportX = Math.max(0, Math.min(miniW - viewportW, (camera.x - (window.innerWidth / (2 * camera.zoom))) * scaleX));
  const viewportY = Math.max(0, Math.min(miniH - viewportH, (camera.y - (window.innerHeight / (2 * camera.zoom))) * scaleY));

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-2 border-slate-700/80 rounded-lg p-2 shadow-2xl flex flex-col gap-2 select-none">
      <div className="flex items-center justify-between text-xs text-slate-300 font-medium px-1">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold tracking-wide uppercase text-[10px]">Radar Continental</span>
        </div>
        <span className="font-mono text-[10px] text-amber-400">
          {(camera.zoom * 100).toFixed(0)}%
        </span>
      </div>

      {/* Canvas / Visor del radar */}
      <div
        ref={containerRef}
        onClick={handleMinimapClick}
        style={{ width: `${miniW}px`, height: `${miniH}px` }}
        className="relative bg-slate-950 rounded border border-slate-700 overflow-hidden cursor-crosshair group shadow-inner"
      >
        {/* Biomas en miniatura */}
        {BIOMES.map((b) => (
          <div
            key={b.name}
            style={{
              left: `${b.x * scaleX}px`,
              top: `${b.y * scaleY}px`,
              width: `${b.width * scaleX}px`,
              height: `${b.height * scaleY}px`,
              backgroundColor: b.primaryColor,
              opacity: 0.65,
            }}
            className="absolute pointer-events-none"
          />
        ))}

        {/* Puntos de Pokémon */}
        {simulation.entities.map((e) => {
          const info = POKEDEX[e.speciesId];
          const isAlpha = e.packRole === 'ALPHA';
          return (
            <div
              key={e.id}
              style={{
                left: `${e.x * scaleX}px`,
                top: `${e.y * scaleY}px`,
                backgroundColor: isAlpha ? '#FACC15' : info?.fallbackColor || '#FFFFFF',
                width: isAlpha ? '4px' : '2.5px',
                height: isAlpha ? '4px' : '2.5px',
              }}
              className={`absolute rounded-full pointer-events-none ${
                isAlpha ? 'ring-1 ring-amber-300 ring-offset-0.5' : ''
              }`}
            />
          );
        })}

        {/* Recuadro del viewport de la cámara */}
        <div
          style={{
            left: `${viewportX}px`,
            top: `${viewportY}px`,
            width: `${viewportW}px`,
            height: `${viewportH}px`,
          }}
          className="absolute border-2 border-amber-400 bg-amber-400/10 pointer-events-none transition-all duration-75 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
        />
      </div>

      {/* Controles de Zoom Rápido y Salto */}
      <div className="grid grid-cols-4 gap-1">
        <button
          onClick={() => setCamera((c) => ({ ...c, zoom: 0.18, targetZoom: 0.18 }))}
          className="py-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium rounded transition-colors text-center"
          title="Vista Continental Satelital (Todo el Mapa)"
        >
          Satélite
        </button>
        <button
          onClick={() => setCamera((c) => ({ ...c, zoom: 0.75, targetZoom: 0.75 }))}
          className="py-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium rounded transition-colors text-center"
          title="Vista Regional"
        >
          Región
        </button>
        <button
          onClick={() => setCamera((c) => ({ ...c, zoom: 2.2, targetZoom: 2.2 }))}
          className="py-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium rounded transition-colors text-center"
          title="Vista Micro de Detalle"
        >
          Micro
        </button>
        <button
          onClick={onCenterAlpha}
          className="py-1 px-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-medium rounded transition-colors flex items-center justify-center gap-0.5"
          title="Centrar en el Alfa más poderoso"
        >
          <Crosshair className="w-2.5 h-2.5" />
          Alfa
        </button>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 px-1 font-mono">
        <span>X: {Math.round(camera.x)} Y: {Math.round(camera.y)}</span>
        <span>{simulation.entities.length} criaturas</span>
      </div>
    </div>
  );
};
