# Topotransformer — Codebase Summary

Web application that generates 3D-printable STL models from topographic elevation data.  
Version **0.4.5** — runs locally via `deno task run` on `http://localhost:8000`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Three.js 0.170.0, Leaflet.js — loaded via CDN, no bundler |
| Backend | Deno WebSocket server, SQLite or JSON database |
| 3D Export | STL binary generation in the browser |
| Code Style | APN (Abstract Prefix Notation) — all variables type-prefixed |

## Data Flow

```
Map (Leaflet) → Elevation tiles (RGB PNGs) → Decode to meters
→ Grayscale heightmap → Three.js vertex displacement
→ Solid geometry (baseplate + chamfer + optional text) → STL export
```

## Terrain Sources

| Source | Coverage | Resolution | Provider |
|--------|----------|------------|----------|
| Global (SRTM) | Worldwide | ~30m | NASA / AWS Terrarium tiles |
| swissALTI3D | Switzerland | 0.5m | swisstopo API |
| Mars (MOLA) | Mars | ~463m | AWS Terrarium tiles |

## Pages / Routes

| Route | Description |
|-------|-------------|
| `/main` | Unified map-to-3D interface — source selector, Leaflet map, export controls |
| `/bw-image-to-3d` | Upload a grayscale image and convert it to a 3D model |
| `/landslide` | Swiss landslide/natural disaster event catalog |
| `/data` | Data management |
| `/filebrowser` | File browser |

## Key Files

| File | Purpose |
|------|---------|
| `localhost/index.js` | Vue 3 app entry, WebSocket connection, routing |
| `localhost/o_component__unified.js` | Main map UI: source selector, map, search, export controls |
| `localhost/o_component__bw_image_to_3d.js` | Grayscale image to 3D converter |
| `localhost/o_component__landslide.js` | Landslide event catalog |
| `localhost/stl_pipeline.js` | 3D geometry: displacement, solid geometry, chamfer, text, STL export |
| `localhost/o_config__source.js` | Terrain source configs, tile URLs, elevation decoders, coordinate transforms |
| `localhost/constructors.js` | Data model definitions, WebSocket message types |
| `websersocket_*.js` | Deno server: HTTP, WebSocket, DB init, static file serving |
| `serverside/database_functions.js` | Database abstraction (SQLite/JSON CRUD) |
| `serverside/functions.js` | Server utilities: filesystem traversal, WebSocket routing |
| `serverside/cli_functions.js` | Python subprocess management (venv, speech synthesis) |

## Implemented Features

### Map Interface
- Interactive Leaflet map with pan/zoom
- Terrain source selector (Global / Switzerland / Mars)
- Location search (Nominatim for global, swisstopo API for Switzerland)
- Selection rectangle for cropping the export area
- Aspect ratio presets (free, 1:1, 4:3, 16:9, portrait)
- Elevation overlay toggle
- Zoom level info display

### 3D Model Generation
- Heightmap generation from elevation tiles (RGB-encoded → meters)
- Vertex displacement on plane, sphere, or cylinder geometry
- Configurable baseplate thickness (minimum 10mm enforced)
- Chamfered edges for 3D printing
- Text engraving with adjustable depth
- Material properties (color, metalness, roughness)
- Tiling support for large area processing

### Export
- STL binary download
- PNG heightmap export

## External APIs

| API | Usage |
|-----|-------|
| AWS S3 Terrarium tiles | Elevation data (Global + Mars) |
| swisstopo WMTS | Swiss elevation + map tiles |
| swisstopo SearchServer | Swiss location search |
| swisstopo coordinate API | WGS84 ↔ CH1903+ conversion |
| Nominatim (OpenStreetMap) | Global location search |
