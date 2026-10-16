import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PokemonEntity, CameraState } from './types/pokemon';
import { EcosystemSimulation } from './simulation/ecosystem';
import {
  generateInitialBerryBushes,
  generateInitialElementalStones,
  generateDecorations,
} from './simulation/world';
import { WorldCanvas } from './components/WorldCanvas';
import { Minimap } from './components/Minimap';
import { PokedexInspector } from './components/PokedexInspector';
import { GodControls } from './components/GodControls';

export default function App() {
  // Inicialización única de simulación y recursos
  const initialBushes = useMemo(() => generateInitialBerryBushes(), []);
  const initialStones = useMemo(() => generateInitialElementalStones(), []);
  const decorations = useMemo(() => generateDecorations(), []);

  const simulationRef = useRef<EcosystemSimulation | null>(null);
  if (!simulationRef.current) {
    simulationRef.current = new EcosystemSimulation(initialBushes, initialStones);
  }
  const simulation = simulationRef.current;

  // Estado de la cámara (Empieza en el centro del continente con vista amplia)
  const [camera, setCamera] = useState<CameraState>({
    x: 1600,
    y: 1200,
    zoom: 0.75,
    targetZoom: 0.75,
    followEntityId: null,
    isDragging: false,
  });

  // Estado de selección del inspector
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [timeSpeed, setTimeSpeed] = useState<number>(1);
  const [dayTimeRatio, setDayTimeRatio] = useState<number>(0.2); // Día radiante
  const [activeDivineTool, setActiveDivineTool] = useState<string | null>(null);

  // Obtener entidad seleccionada actualizada en cada render
  const selectedEntity = useMemo(() => {
    if (!selectedEntityId) return null;
    return simulation.entities.find((e) => e.id === selectedEntityId) || null;
  }, [selectedEntityId, simulation.entities]);

  // Bucle de simulación desacoplado
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (currentTime: number) => {
      const deltaSec = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (timeSpeed > 0) {
        // Ejecutar pasos de simulación según la velocidad seleccionada
        simulation.update(deltaSec * timeSpeed);

        // Avanzar ciclo día/noche suavemente (1 ciclo completo cada 4 minutos)
        setDayTimeRatio((prev) => (prev + (deltaSec * timeSpeed) / 240) % 1);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [timeSpeed, simulation]);

  // Manejar acciones divinas al hacer clic en el lienzo
  const handleApplyDivineTool = (worldX: number, worldY: number) => {
    if (!activeDivineTool) return;

    if (activeDivineTool === 'berry') {
      simulation.bushes.push({
        id: `bush-${Date.now()}`,
        x: worldX,
        y: worldY,
        berryType: 'sitrus',
        berriesCount: 4,
        maxBerries: 5,
        regrowTimer: 0,
      });
      simulation.addEvent({
        type: 'divine',
        icon: '🍓',
        title: 'Arboleda de Bayas Creada',
        description: `Un milagro botánico ha hecho brotar un arbusto de bayas Zidra en el terreno.`,
        location: { x: worldX, y: worldY },
      });
    } else if (activeDivineTool === 'thunder') {
      simulation.divineStrike(worldX, worldY);
    } else if (activeDivineTool === 'egg') {
      simulation.nests.push({
        id: `nest-${Date.now()}`,
        x: worldX,
        y: worldY,
        packId: 'divine-nest',
        eggs: [
          {
            id: `egg-${Date.now()}`,
            speciesId: Math.random() > 0.5 ? 25 : 133, // Pikachu o Eevee
            parents: ['Génesis Divino', 'Génesis Divino'],
            incubationRemaining: 10,
            generation: simulation.maxGeneration + 1,
          },
        ],
      });
      simulation.addEvent({
        type: 'divine',
        icon: '🥚',
        title: 'Nido Milagroso Depositado',
        description: `Una energía misteriosa ha manifestado un huevo en el suelo.`,
        location: { x: worldX, y: worldY },
      });
    }

    setActiveDivineTool(null);
  };

  // Centrar en el Alfa más poderoso
  const handleCenterAlpha = () => {
    let bestAlpha: PokemonEntity | null = null;
    let maxLevel = -1;

    for (const entity of simulation.entities) {
      if (entity.packRole === 'ALPHA' && entity.level > maxLevel) {
        maxLevel = entity.level;
        bestAlpha = entity;
      }
    }

    if (bestAlpha) {
      setCamera((prev) => ({
        ...prev,
        x: bestAlpha!.x,
        y: bestAlpha!.y,
        zoom: 2.0,
        targetZoom: 2.0,
        followEntityId: bestAlpha!.id,
      }));
      setSelectedEntityId(bestAlpha.id);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Barra Superior & Dock Inferior */}
      <GodControls
        simulation={simulation}
        timeSpeed={timeSpeed}
        setTimeSpeed={setTimeSpeed}
        dayTimeRatio={dayTimeRatio}
        setDayTimeRatio={setDayTimeRatio}
        activeTool={activeDivineTool}
        setActiveTool={setActiveDivineTool}
      />

      {/* Escenario de Simulación en Canvas 2D */}
      <WorldCanvas
        simulation={simulation}
        camera={camera}
        setCamera={setCamera}
        selectedEntity={selectedEntity}
        onSelectEntity={(e) => setSelectedEntityId(e ? e.id : null)}
        dayTimeRatio={dayTimeRatio}
        decorations={decorations}
        activeDivineTool={activeDivineTool}
        onApplyDivineTool={handleApplyDivineTool}
      />

      {/* Minimapa Radar (Esquina Inferior Izquierda) */}
      <div className="fixed bottom-20 left-4 z-20">
        <Minimap
          simulation={simulation}
          camera={camera}
          setCamera={setCamera}
          onCenterAlpha={handleCenterAlpha}
        />
      </div>

      {/* Pokédex Bio Inspector (Lateral Derecho) */}
      {selectedEntity && (
        <div className="fixed top-18 right-4 z-20">
          <PokedexInspector
            entity={selectedEntity}
            simulation={simulation}
            onClose={() => setSelectedEntityId(null)}
            onFollowEntity={(id) => {
              setCamera((c) => ({
                ...c,
                followEntityId: c.followEntityId === id ? null : id,
                targetZoom: Math.max(c.zoom, 1.8),
              }));
            }}
            isFollowing={camera.followEntityId === selectedEntity.id}
          />
        </div>
      )}

      {/* Ayuda Rápida de Teclas y Controles (Esquina Inferior Derecha) */}
      <div className="fixed bottom-4 right-4 z-10 hidden xl:flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 select-none shadow">
        <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-200">WASD</kbd> Mover</span>
        <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-200">Rueda</kbd> Zoom</span>
        <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-200">Clic</kbd> Inspeccionar</span>
        <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-200">Arrastrar</kbd> Pan</span>
      </div>
    </div>
  );
}
