# PokéGenesis: Simulador Sandbox Estilo WorldBox en el Universo Pokémon (Mapa 10.000×8.000px)

Un simulador de mundo vivo inspirado directamente en la jugabilidad de **WorldBox**, adaptado al universo Pokémon con estética pixel art detallada de **Pokémon Essentials / GBA**. Los Pokémon no son simples animales errantes, sino que forman **Tribus y Clanes con territorios que se expanden por el mapa**, eligen líderes, construyen nidos y tótems, declaran guerras o pactan alianzas simbióticas, mientras el jugador ejerce de **Dios Absoluto con la clásica botonera y herramientas de WorldBox** (pinceles de terraformación de terreno, cataclismos, rayos, meteoritos, bendición divina, semillas de vida y control de reinos).

### User Review & Critical Decisions

> [!IMPORTANT]
> **Alineación con la Jugabilidad de WorldBox:**
> - **Caja de Herramientas de Dios (WorldBox UI & Powers)**:
>   - *Pinceles de Terreno en Tiempo Real*: Pintar hierba, bosque espeso, agua somera, agua profunda, arena, roca/montaña, lava volcánica y nieve con selector de radio de pincel (Pequeño, Mediano, Grande).
>   - *Generadores de Vida*: Pincel de Spawner individual o en grupo de cualquier especie Pokémon en cualquier punto del mundo.
>   - *Poderes y Cataclismos*: Rayo destructor, caída de Meteorito con cráter de fuego, Bomba de dinamita, Lluvia Sanadora (cura a todos en el área), Bendición Divina (aumenta tamaño y stats al doble con halo dorado) y Niebla de Locura (provoca batallas campales frenéticas).
>   - *Vegetación y Recursos*: Pinceles de árboles, arbustos de bayas, rocas minerales y fuentes de agua.
> - **Reinos y Tribus Pokémon con Fronteras Dinámicas (Estilo WorldBox)**:
>   - Las especies organizan **Clanes / Asentamientos** con nombre propio, bandera elemental y un Líder o Patriarca.
>   - **Fronteras Territoriales Visibles**: Capa de mapa que colorea las celdas reclamadas por cada tribu. Cuando una tribu crece y tiene crías, sus fronteras se expanden sobre el mapa; si sufren escasez o derrotas, su territorio se encoge.
>   - **Diplomacia y Guerras de Clanes**: Estados de relación claros entre tribus (Paz, Alianza Simbiótica o Guerra Territorial Total).
> - **Sistema de Rasgos & Títulos estilo WorldBox**:
>   - Cada criatura puede nacer con o adquirir rasgos emblemáticos: *Gigante, Feroz, Sabio, Veterano de Guerra, Inmortal, Glotón, Rápido, Bendecido por el Creador*.
> - **Mundo Colosal de 10.000 × 8.000 Píxeles**:
>   - Mapa inmenso con tilesets detallados estilo Pokémon Essentials (caminos de tierra, espuma en costas, hierba alta, árboles con volumen y acantilados), navegable con zoom ultra-profundo (0.08x a 4.0x) y minimapa interactivo.

---

### 1. Overview & Core Concept

- **What It Does**: Una auténtica experiencia WorldBox donde las razas son especies de Pokémon. Los clanes colonizan valles y llanuras, defienden sus fronteras, forrajean y van a la guerra contra tribus enemigas por el control de fuentes de agua y arboledas de bayas.
- **The Player Experience**: El jugador puede sentarse a observar el auge y caída de civilizaciones de Pokémon, o intervenir directamente lanzando bendiciones a su clan favorito, provocando un invierno repentino, haciendo caer un meteorito sobre una manada invasora o terraformando un río para conectar dos tribus.
- **Key Value**: Jugabilidad sandbox emergente de libertad total, con herramientas táctiles y satisfactorias, gráficos nostálgicos de GBA y profundidad biológica y política.

---

### 2. User Experience & Visual Design

#### A. Barra de Herramientas de Dios estilo WorldBox (Dock Inferior Modular)
Organizada en pestañas intuitivas:
1. **Pestaña Terreno (Terraforming)**:
   - Pincel Hierba / Prado
   - Pincel Bosque Denso
   - Pincel Agua Somera / Agua Profunda
   - Pincel Montaña / Roca
   - Pincel Arena / Desierto
   - Pincel Lava Volcánica
   - Pincel Nieve / Hielo
   - *Selector de tamaño de pincel*: Pequeño (1x), Mediano (3x), Grande (6x).
2. **Pestaña Vida & Criaturas (Spawners)**:
   - Spawners de Bulbasaur, Charmander, Squirtle, Pikachu, Caterpie, Pidgey, Geodude, Magikarp, Eevee, Snorlax, Mew y más.
3. **Pestaña Naturaleza & Recursos**:
   - Sembrar Arboleda de Bayas (Zidra, Meloc, Lum)
   - Colocar Piedras Evolutivas
   - Generar Nidos de Huevos
4. **Pestaña Poderes Divinos & Cataclismos**:
   - ⚡ **Rayo Celestial**: Daño concentrado y quemaduras de terreno.
   - ☄️ **Meteorito**: Explosión colosal con cráter y fuego en el suelo.
   - ✨ **Bendición**: Triplica salud, otorga halo dorado y hace al Pokémon gigante.
   - 💖 **Lluvia Curativa**: Regenera la salud de todos los seres y extingue incendios.
   - 🌀 **Locura (Madness)**: Vuelve a los Pokémon temporalmente hostiles con ojos rojos.
   - 💣 **Bomba**: Destrucción inmediata de terreno y obstáculos.
5. **Pestaña Capas de Información (Overlays)**:
   - Activar/Desactivar Fronteras de Tribus
   - Activar/Desactivar Nombres de Asentamientos
   - Activar/Desactivar Líneas de Guerra y Alianzas

#### B. Inspección de Criaturas estilo WorldBox
- Panel lateral con diseño Pokédex + Ficha de Héroe de WorldBox:
  - Sprite grande y animado con halo de rasgos (ej. aura dorada si está bendecido).
  - Títulos honoríficos adquiridos ("El Conquistador del Lago", "El Devorador de Bayas", "El Patriarca").
  - Iconos de Rasgos clickeables con tooltips (Fuerza Bruta, Veloz, Inmortal, Enano, Gigante, Valiente).
  - Pertenencia a Tribu y Lealtad a su Líder.
  - Botón de "Matar", "Bendecir" o "Seguir Cámara".

---

### 3. Key Product Decisions & Trade-Offs

- **Cuadrícula de Terreno y Fronteras de Tribu Dinámicas**:
  - *Decisión*: El mapa de 10.000×8.000 se modela como una matriz de celdas de terreno (tiles) sobre la cual se proyecta el algoritmo de influencia territorial (Voronoi territorial de clanes). Los clanes reclaman tiles adyacentes a su nido central.
  - *Por qué*: Reproduce exactamente la sensación visual y mecánica de WorldBox de ver fronteras de colores expandirse y replegarse en tiempo real.
- **Pinceles de Terraformación Rápidos en Canvas**:
  - *Decisión*: Al arrastrar el ratón con un pincel de terreno activo, se modifican los tiles del mapa de forma inmediata con retroalimentación acústica y visual en el frame actual.
  - *Por qué*: Es la esencia de la diversión en juegos tipo sandbox como WorldBox (crear islas, abrir canales de agua o levantar murallas de montaña).
- **Rendimiento con Chunking & Viewport Culling**:
  - A pesar de la escala masiva (10k×8k) y los poderes explosivos, solo se procesan gráficamente los tiles visibles en la pantalla, garantizando 60 FPS estables.

---

### 4. Technical Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│               POKÉGENESIS: WORLDBOX EDITION (10.000 x 8.000)          │
├────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │       TOP TELEMETRY BAR            │ │      TIME & WORLD CYCLES    │ │
│ │ · Población · Clanes · Guerras     │ │ · Pausa · 1x · 2x · 5x      │ │
│ └────────────────────────────────────┘ └─────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ ┌───────────────┐ │
│ │       CANVAS VIEWPORT (10.000 x 8.000 PX)        │ │ WORLDBOX BIO  │ │
│ │                                                  │ │ INSPECTOR     │ │
│ │ · Terreno Editable en Tiempo Real (Tilesets GBA) │ │ · Rasgos/Perks│ │
│ │ · Capa de Fronteras Territoriales de Clanes      │ │ · Títulos     │ │
│ │ · Efectos de Cataclismos: Rayos, Meteoritos,     │ │ · Clan & Rol  │ │
│ │   Incendios, Lluvia Curativa                     │ │ · Bendición   │ │
│ │ · IA Biológica: Sed, sombras, guerras de clanes  │ │ · Seguir Cam  │ │
│ │ · Zoom 0.08x a 4.0x con Mouse Anchor             │ │               │ │
│ └──────────────────────────────────────────────────┘ └───────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                   WORLDBOX GOD TOOLS DOCK                          │ │
│ │ [Terreno: Hierba/Agua/Lava/Roca] [Vida: Spawners] [Poderes: Rayo/  │ │
│ │  Meteorito/Bendición/Locura] [Capas: Fronteras/Guerras] [Pincel:SML│ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```
