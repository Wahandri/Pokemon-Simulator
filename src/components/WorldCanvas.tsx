import React, { useRef, useEffect, useCallback } from 'react';
import {
  PokemonEntity,
  CameraState,
  WeatherType,
  BerryBush,
  Nest,
  ElementalStone,
  BattleParticle,
} from '../types/pokemon';
import { EcosystemSimulation } from '../simulation/ecosystem';
import { WORLD_WIDTH, WORLD_HEIGHT, BIOMES, TerrainDecoration } from '../simulation/world';
import { POKEDEX } from '../data/pokedex';

interface WorldCanvasProps {
  simulation: EcosystemSimulation;
  camera: CameraState;
  setCamera: React.Dispatch<React.SetStateAction<CameraState>>;
  selectedEntity: PokemonEntity | null;
  onSelectEntity: (entity: PokemonEntity | null) => void;
  dayTimeRatio: number; // 0 a 1 (0: mediodía, 0.5: atardecer, 0.75: noche)
  decorations: TerrainDecoration[];
  activeDivineTool: string | null;
  onApplyDivineTool: (worldX: number, worldY: number) => void;
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  simulation,
  camera,
  setCamera,
  selectedEntity,
  onSelectEntity,
  dayTimeRatio,
  decorations,
  activeDivineTool,
  onApplyDivineTool,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const spriteCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());

  // Precargar sprites oficiales animados
  useEffect(() => {
    Object.values(POKEDEX).forEach((species) => {
      if (!spriteCacheRef.current.has(species.id)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = species.spriteUrl;
        spriteCacheRef.current.set(species.id, img);
      }
    });
  }, []);

  // Seguimiento automático suave si hay Follow Cam activo
  useEffect(() => {
    if (camera.followEntityId) {
      const target = simulation.entities.find((e) => e.id === camera.followEntityId);
      if (target) {
        setCamera((prev) => ({
          ...prev,
          x: prev.x + (target.x - prev.x) * 0.1,
          y: prev.y + (target.y - prev.y) * 0.1,
        }));
      }
    }
  }, [camera.followEntityId, simulation.entities, setCamera]);

  // Manejo de eventos de ratón para Navegación & Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      // Clic izquierdo
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      // Desactivar follow cam si el usuario arrastra manualmente la cámara
      setCamera((prev) => ({
        ...prev,
        x: Math.max(100, Math.min(WORLD_WIDTH - 100, prev.x - dx / prev.zoom)),
        y: Math.max(100, Math.min(WORLD_HEIGHT - 100, prev.y - dy / prev.zoom)),
        followEntityId: null,
      }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      // Si fue un clic simple casi sin movimiento, detectar selección de Pokémon o uso de herramienta divina
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Convertir pantalla a coordenadas del mundo
      const worldX = (mouseX - canvas.width / 2) / camera.zoom + camera.x;
      const worldY = (mouseY - canvas.height / 2) / camera.zoom + camera.y;

      if (activeDivineTool) {
        onApplyDivineTool(worldX, worldY);
        return;
      }

      // Buscar si se clicó sobre un Pokémon
      let clickedEntity: PokemonEntity | null = null;
      let minClickDist = 36 / camera.zoom; // Radio dinámico según zoom

      for (const entity of simulation.entities) {
        const dist = Math.hypot(entity.x - worldX, entity.y - worldY);
        if (dist < minClickDist) {
          minClickDist = dist;
          clickedEntity = entity;
        }
      }

      if (clickedEntity) {
        onSelectEntity(clickedEntity);
        setCamera((prev) => ({
          ...prev,
          followEntityId: clickedEntity!.id,
          targetZoom: Math.max(prev.zoom, 1.8), // Hace zoom suave para observar de cerca
        }));
      } else {
        onSelectEntity(null);
      }
    }
  };

  // Zoom centrado en cursor del ratón (Mouse-anchored zoom)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;

      // Punto del mundo antes del zoom
      const worldBeforeX = (mouseScreenX - canvas.width / 2) / camera.zoom + camera.x;
      const worldBeforeY = (mouseScreenY - canvas.height / 2) / camera.zoom + camera.y;

      // Factor de zoom (de 0.15 a 4.0)
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.max(0.15, Math.min(4.0, camera.zoom * zoomFactor));

      // Ajustar centro de la cámara para que el punto bajo el cursor no se mueva
      const newCamX = worldBeforeX - (mouseScreenX - canvas.width / 2) / newZoom;
      const newCamY = worldBeforeY - (mouseScreenY - canvas.height / 2) / newZoom;

      setCamera((prev) => ({
        ...prev,
        zoom: newZoom,
        targetZoom: newZoom,
        x: Math.max(100, Math.min(WORLD_WIDTH - 100, newCamX)),
        y: Math.max(100, Math.min(WORLD_HEIGHT - 100, newCamY)),
      }));
    },
    [camera.zoom, camera.x, camera.y, setCamera]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Teclas WASD / Flechas para navegación fluida
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 60 / camera.zoom;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setCamera((c) => ({ ...c, y: Math.max(100, c.y - step), followEntityId: null }));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setCamera((c) => ({ ...c, y: Math.min(WORLD_HEIGHT - 100, c.y + step), followEntityId: null }));
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setCamera((c) => ({ ...c, x: Math.max(100, c.x - step), followEntityId: null }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setCamera((c) => ({ ...c, x: Math.min(WORLD_WIDTH - 100, c.x + step), followEntityId: null }));
      } else if (e.key === '+') {
        setCamera((c) => ({ ...c, zoom: Math.min(4.0, c.zoom * 1.2) }));
      } else if (e.key === '-') {
        setCamera((c) => ({ ...c, zoom: Math.max(0.15, c.zoom / 1.2) }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera.zoom, setCamera]);

  // Loop de Renderizado 60 FPS con Frustum Culling
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Ajustar tamaño de canvas al contenedor
      const width = canvas.parentElement?.clientWidth || 1000;
      const height = canvas.parentElement?.clientHeight || 700;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Configuración de renderizado pixel-art sin borrosidad
      ctx.imageSmoothingEnabled = false;

      // Limpiar fondo
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Transformación de cámara
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.x, -camera.y);

      // Frustum culling box (área visible del mundo)
      const visibleLeft = camera.x - width / (2 * camera.zoom);
      const visibleRight = camera.x + width / (2 * camera.zoom);
      const visibleTop = camera.y - height / (2 * camera.zoom);
      const visibleBottom = camera.y + height / (2 * camera.zoom);

      // 1. Dibujar Biomas de fondo
      for (const biome of BIOMES) {
        // Frustum check
        if (
          biome.x + biome.width < visibleLeft ||
          biome.x > visibleRight ||
          biome.y + biome.height < visibleTop ||
          biome.y > visibleBottom
        ) {
          continue;
        }

        ctx.fillStyle = biome.primaryColor;
        ctx.fillRect(biome.x, biome.y, biome.width, biome.height);

        // Borde estilizado del bioma
        ctx.strokeStyle = biome.accentColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(biome.x, biome.y, biome.width, biome.height);

        // Si el zoom es macro (<0.35x), dibujar rótulo del bioma
        if (camera.zoom < 0.45) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.font = 'bold 24px monospace';
          ctx.fillText(biome.name.toUpperCase(), biome.x + 30, biome.y + 50);
        }
      }

      // 2. Límites del Continente (Línea de costa y océano exterior)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 12;
      ctx.strokeRect(60, 60, WORLD_WIDTH - 120, WORLD_HEIGHT - 120);

      // 3. Decoraciones del terreno (árboles, rocas, flores)
      for (const dec of decorations) {
        if (
          dec.x < visibleLeft - 40 ||
          dec.x > visibleRight + 40 ||
          dec.y < visibleTop - 40 ||
          dec.y > visibleBottom + 40
        ) {
          continue;
        }

        drawDecoration(ctx, dec, camera.zoom);
      }

      // 4. Territorios de Manadas (resplandor circular sutil)
      if (camera.zoom <= 1.2) {
        simulation.packs.forEach((pack) => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(pack.territoryCenter.x, pack.territoryCenter.y, pack.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${pack.color}15`;
          ctx.fill();
          ctx.strokeStyle = `${pack.color}55`;
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 8]);
          ctx.stroke();

          // Etiqueta de la manada
          if (camera.zoom < 0.6) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px monospace';
            ctx.fillText(pack.name, pack.territoryCenter.x - 30, pack.territoryCenter.y - pack.radius + 20);
          }
          ctx.restore();
        });
      }

      // 5. Nidos con Huevos
      for (const nest of simulation.nests) {
        if (
          nest.x < visibleLeft - 50 ||
          nest.x > visibleRight + 50 ||
          nest.y < visibleTop - 50 ||
          nest.y > visibleBottom + 50
        ) {
          continue;
        }

        drawNest(ctx, nest);
      }

      // 6. Piedras Evolutivas en el mundo
      for (const stone of simulation.stones) {
        if (
          stone.x < visibleLeft - 40 ||
          stone.x > visibleRight + 40 ||
          stone.y < visibleTop - 40 ||
          stone.y > visibleBottom + 40
        ) {
          continue;
        }

        drawElementalStone(ctx, stone);
      }

      // 7. Arbustos de Bayas
      for (const bush of simulation.bushes) {
        if (
          bush.x < visibleLeft - 40 ||
          bush.x > visibleRight + 40 ||
          bush.y < visibleTop - 40 ||
          bush.y > visibleBottom + 40
        ) {
          continue;
        }

        drawBerryBush(ctx, bush);
      }

      // 8. Especies Pokémon (Entidades)
      // Ordenar por coordenada Y para oclusión de profundidad (renderizado 2.5D)
      const sortedEntities = [...simulation.entities].sort((a, b) => a.y - b.y);

      for (const entity of sortedEntities) {
        if (
          entity.x < visibleLeft - 60 ||
          entity.x > visibleRight + 60 ||
          entity.y < visibleTop - 60 ||
          entity.y > visibleBottom + 60
        ) {
          continue;
        }

        const isSelected = selectedEntity?.id === entity.id;
        drawPokemon(ctx, entity, isSelected, spriteCacheRef.current, camera.zoom);
      }

      // 9. Partículas de Combate
      for (const p of simulation.particles) {
        if (
          p.x < visibleLeft - 50 ||
          p.x > visibleRight + 50 ||
          p.y < visibleTop - 50 ||
          p.y > visibleBottom + 50
        ) {
          continue;
        }

        drawParticle(ctx, p);
      }

      // 10. Clima y Partículas Atmosféricas (Lluvia, Nieve, Ceniza)
      drawWeatherEffects(ctx, simulation.weather, visibleLeft, visibleRight, visibleTop, visibleBottom);

      // 11. Capa de Día y Noche
      drawDayNightCycle(ctx, dayTimeRatio, visibleLeft, visibleRight, visibleTop, visibleBottom);

      ctx.restore();

      // UI HUD Overlay sobre canvas (Retícula de selección o mira si se pasa el ratón)
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    camera,
    simulation,
    selectedEntity,
    dayTimeRatio,
    decorations,
    activeDivineTool,
  ]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`w-full h-full block ${
          activeDivineTool ? 'cursor-crosshair' : isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      />
    </div>
  );
};

// --- Funciones Auxiliares de Dibujado en Canvas ---

function drawPokemon(
  ctx: CanvasRenderingContext2D,
  entity: PokemonEntity,
  isSelected: boolean,
  cache: Map<number, HTMLImageElement>,
  zoom: number
) {
  const info = POKEDEX[entity.speciesId];
  if (!info) return;

  ctx.save();
  ctx.translate(entity.x, entity.y);

  // Sombra elíptica en el suelo
  ctx.beginPath();
  ctx.ellipse(0, 8, 14 * entity.scale, 6 * entity.scale, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fill();

  // Halo de selección divino si está seleccionado
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(0, 0, 24 * entity.scale, 0, Math.PI * 2);
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Sprite oficial animado o fallback procedural en canvas
  const img = cache.get(entity.speciesId);
  const spriteSize = 36 * entity.scale;

  if (img && img.complete && img.naturalWidth > 0) {
    // Si la velocidad X es negativa, voltear horizontalmente
    if (entity.vx < -0.1) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(img, -spriteSize / 2, -spriteSize + 8, spriteSize, spriteSize);
    if (entity.vx < -0.1) {
      ctx.scale(-1, 1); // Revertir escala
    }
  } else {
    // Fallback Pixel-art Procedural nítido
    ctx.fillStyle = info.fallbackColor;
    ctx.beginPath();
    ctx.roundRect(-spriteSize / 3, -spriteSize + 6, (spriteSize * 2) / 3, spriteSize * 0.8, 6);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ojos
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-6, -spriteSize + 12, 4, 4);
    ctx.fillRect(2, -spriteSize + 12, 4, 4);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-5, -spriteSize + 13, 2, 2);
    ctx.fillRect(3, -spriteSize + 13, 2, 2);
  }

  // Corona para el Alfa de la manada
  if (entity.packRole === 'ALPHA') {
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('👑', -6, -spriteSize - 2);
  }

  // Emote sobre la cabeza (corazones, sueño, combate, etc.)
  if (entity.emote) {
    ctx.font = '14px sans-serif';
    ctx.fillText(entity.emote, -7, -spriteSize - 8);
  }

  // Barra de salud rápida si está dañado o si hay zoom cercano (>1.5x)
  if (zoom > 1.3 || entity.hp < entity.maxHp) {
    const barW = 28;
    const barH = 4;
    const hpRatio = Math.max(0, entity.hp / entity.maxHp);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-barW / 2, -spriteSize - 3, barW, barH);

    ctx.fillStyle = hpRatio > 0.5 ? '#22C55E' : hpRatio > 0.2 ? '#EAB308' : '#EF4444';
    ctx.fillRect(-barW / 2 + 1, -spriteSize - 2, (barW - 2) * hpRatio, barH - 2);
  }

  // Nombre de la criatura si hay super-zoom (>2.2x)
  if (zoom > 2.2) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(entity.nickname, 0, 18);
  }

  ctx.restore();
}

function drawDecoration(ctx: CanvasRenderingContext2D, dec: TerrainDecoration, zoom: number) {
  ctx.save();
  ctx.translate(dec.x, dec.y);

  if (dec.type === 'tree') {
    // Árbol frondoso estilo Pokémon Rojo Fuego
    ctx.fillStyle = '#1e3f1a';
    ctx.fillRect(-4, 0, 8, 12); // Tronco

    ctx.beginPath();
    ctx.arc(0, -10, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#2d5a27';
    ctx.fill();
    ctx.strokeStyle = '#183015';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (dec.type === 'rock') {
    ctx.beginPath();
    ctx.roundRect(-8, -6, 16, 12, 4);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();
  } else if (dec.type === 'cactus') {
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-3, -14, 6, 18);
    ctx.fillRect(-10, -10, 7, 4);
    ctx.fillRect(-10, -14, 4, 6);
    ctx.fillRect(3, -6, 7, 4);
    ctx.fillRect(6, -10, 4, 6);
  } else if (dec.type === 'flower') {
    if (zoom > 0.6) {
      ctx.fillStyle = dec.variant === 0 ? '#ef4444' : dec.variant === 1 ? '#3b82f6' : '#eab308';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (dec.type === 'ice_spike') {
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(6, 4);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fillStyle = '#bae6fd';
    ctx.fill();
  }

  ctx.restore();
}

function drawBerryBush(ctx: CanvasRenderingContext2D, bush: BerryBush) {
  ctx.save();
  ctx.translate(bush.x, bush.y);

  // Arbusto verde
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#166534';
  ctx.fill();
  ctx.strokeStyle = '#14532d';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bayas visibles
  const berryColors = {
    oran: '#3b82f6',
    sitrus: '#eab308',
    pecha: '#f43f5e',
    lum: '#84cc16',
  };

  for (let i = 0; i < bush.berriesCount; i++) {
    const angle = (i / bush.maxBerries) * Math.PI * 2;
    const bx = Math.cos(angle) * 6;
    const by = Math.sin(angle) * 6;
    ctx.beginPath();
    ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = berryColors[bush.berryType as keyof typeof berryColors] || '#f43f5e';
    ctx.fill();
  }

  ctx.restore();
}

function drawNest(ctx: CanvasRenderingContext2D, nest: Nest) {
  ctx.save();
  ctx.translate(nest.x, nest.y);

  // Nido de ramas
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#78350f';
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Huevos en el nido
  nest.eggs.forEach((_egg: unknown, idx: number) => {
    const offset = (idx - nest.eggs.length / 2) * 8;
    ctx.beginPath();
    ctx.ellipse(offset, 0, 5, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.stroke();
  });

  ctx.restore();
}

function drawElementalStone(ctx: CanvasRenderingContext2D, stone: ElementalStone) {
  ctx.save();
  ctx.translate(stone.x, stone.y);

  const colors = {
    fire: '#ef4444',
    water: '#3b82f6',
    thunder: '#eab308',
  };

  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(8, 0);
  ctx.lineTo(0, 10);
  ctx.lineTo(-8, 0);
  ctx.closePath();
  ctx.fillStyle = colors[stone.stoneType as keyof typeof colors];
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, p: BattleParticle) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, p.life / p.maxLife);

  if (p.type === 'text' && p.text) {
    ctx.fillStyle = p.color;
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(p.text, p.x, p.y);
  } else {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawWeatherEffects(
  ctx: CanvasRenderingContext2D,
  weather: WeatherType,
  left: number,
  right: number,
  top: number,
  bottom: number
) {
  if (weather === 'clear') return;

  ctx.save();
  const time = Date.now() * 0.002;

  if (weather === 'rain' || weather === 'thunderstorm') {
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.5)';
    ctx.lineWidth = 1.5;
    const density = 60;
    for (let i = 0; i < density; i++) {
      const rx = left + ((i * 137.5 + time * 300) % (right - left));
      const ry = top + ((i * 219.3 + time * 600) % (bottom - top));
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 8, ry + 16);
      ctx.stroke();
    }
  } else if (weather === 'snow') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const density = 50;
    for (let i = 0; i < density; i++) {
      const sx = left + ((i * 153.2 + Math.sin(time + i) * 30) % (right - left));
      const sy = top + ((i * 187.9 + time * 100) % (bottom - top));
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (weather === 'sandstorm') {
    ctx.fillStyle = 'rgba(217, 119, 6, 0.15)';
    ctx.fillRect(left, top, right - left, bottom - top);
  }

  ctx.restore();
}

function drawDayNightCycle(
  ctx: CanvasRenderingContext2D,
  dayTimeRatio: number,
  left: number,
  right: number,
  top: number,
  bottom: number
) {
  ctx.save();
  // 0 a 0.4: Día radiante
  // 0.4 a 0.6: Atardecer dorado
  // 0.6 a 1.0: Noche profunda
  if (dayTimeRatio >= 0.4 && dayTimeRatio < 0.6) {
    // Atardecer
    const sunsetProgress = (dayTimeRatio - 0.4) / 0.2;
    ctx.fillStyle = `rgba(234, 88, 12, ${sunsetProgress * 0.25})`;
    ctx.fillRect(left, top, right - left, bottom - top);
  } else if (dayTimeRatio >= 0.6) {
    // Noche
    const nightProgress = Math.min(1, (dayTimeRatio - 0.6) / 0.2);
    ctx.fillStyle = `rgba(10, 15, 35, ${nightProgress * 0.6})`;
    ctx.fillRect(left, top, right - left, bottom - top);
  }
  ctx.restore();
}
