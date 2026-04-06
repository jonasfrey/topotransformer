# Topotransformer Refactor Prompt

## Original Input

There is already a web application (Topotransformer v0.4.5) that generates 3D-printable STL models from topographic elevation data. It runs locally via `deno task run` on `http://localhost:8000`. Tech stack: Vue 3, Three.js, Leaflet.js (CDN-loaded, no bundler), Deno WebSocket backend, SQLite/JSON DB. Code uses APN (Abstract Prefix Notation) naming convention.

The user is not satisfied with the current state — there are old unused features, small bugs, and a cluttered UI with overlay windows. They want a major rework focused on:

**GUI requirements:**
- Replace overlay windows with a single sidebar containing all settings
- Main search input for places (e.g. "Matterhorn", "Grand Canyon")
- Visual scale ruler and map scale ratio (e.g. 1:300,000) on the map
- Resolution indicator: target is 8 datapoints/mm (optimized for 0.2mm FDM nozzle), adjustable via GUI, with warning when source data resolution is insufficient
- Aspect ratio selector (default 1:1), affects map region shape
- Side length option (default 170mm)
- Tiling option (default 1; value N creates N×N tiles; side length = master region)
- All other settings in collapsible "Advanced" section
- Small 3D preview window showing coarse terrain of current selection

---

## Improved Prompt

````
# Role & Context

You are a senior full-stack developer specializing in Vue 3, Three.js, Leaflet.js, and Deno. You are tasked with a major refactor of **Topotransformer**, a local web application (Deno backend, Vue 3 frontend via CDN — no bundler) that generates 3D-printable STL terrain models from topographic elevation data.

The codebase (v0.4.5) has accumulated unused features, inconsistent UI patterns (overlay windows, scattered controls), and small bugs. The goal is a clean, focused rework — not a rewrite from scratch. Preserve working core logic (tile fetching, elevation decoding, STL generation pipeline) but restructure the UI and remove dead code.

# Codebase Overview

**Data flow:**
```
Leaflet map → Elevation tiles (RGB PNGs) → Decode to meters
→ Grayscale heightmap → Three.js vertex displacement
→ Solid geometry (baseplate + chamfer + optional text) → STL binary export
```

**Tech:** Vue 3 + Three.js 0.170.0 + Leaflet.js (all CDN-loaded), Deno WebSocket backend, SQLite/JSON DB.  
**Code style:** APN (Abstract Prefix Notation) — all variables are type-prefixed. Maintain this convention.

**Terrain sources:**
- Global (SRTM): ~30 m resolution, AWS Terrarium tiles
- swissALTI3D: 0.5 m resolution, swisstopo WMTS
- Mars (MOLA): ~463 m resolution, AWS Terrarium tiles

**Key files:**
| File | Role |
|------|------|
| `localhost/index.js` | Vue app entry, routing, WebSocket |
| `localhost/o_component__unified.js` | Main map + UI component |
| `localhost/stl_pipeline.js` | 3D geometry, displacement, STL export |
| `localhost/o_config__source.js` | Terrain source configs, decoders |
| `localhost/constructors.js` | Data models, WS message types |
| `websersocket_*.js` | Deno server |

**Routes to keep:** `/main` (primary interface), `/bw-image-to-3d` (grayscale-to-3D converter).  
**Routes to evaluate for removal:** `/landslide`, `/data`, `/filebrowser` — these are unused or out of scope. Flag them for the user before deleting.

# Refactor Requirements

## 1. GUI — Single Sidebar Layout (Primary Goal)

**Eliminate all overlay/modal windows.** Replace with a single, always-visible sidebar (left or right) containing all controls. The map fills the remaining viewport.

**Sidebar sections, top to bottom:**

### Search
- One prominent text input for location search (e.g. "Matterhorn", "Grand Canyon")
- Use Nominatim for global sources, swisstopo SearchServer for Swiss source
- Show autocomplete results in a dropdown below the input

### Terrain Source
- Selector: Global / Switzerland / Mars (keep existing logic)

### Region Settings
- **Aspect ratio** — dropdown, default `1:1`. Options: `1:1`, `4:3`, `3:4`, `16:9`, `9:16`, `Free`. Changing this reshapes the selection rectangle on the map to match.
- **Side length** — numeric input, default `170 mm`. This is the physical print dimension of the longest side of the master region.
- **Tiling** — numeric input or small dropdown, default `1`. Value of N produces N×N sub-tiles. The side length always refers to the full master region, so each tile is `side_length / N` mm. Make it clear in the UI that tiling subdivides the master region.

### Resolution & Data Quality Indicator
- **Print resolution** — numeric input, default `8 datapoints/mm`. Explain in a tooltip: "Optimized for FDM printing with a 0.2 mm nozzle (5 dp/mm minimum). Higher values capture more detail but increase file size."
- **Resolution warning** — when the map zoom level means the source elevation data has lower resolution than the target print resolution, display a visible warning (e.g. amber badge: "Source data: ~30 m/px — target requires ~12 m/px at this scale. Zoom in or reduce print resolution."). Compute this from: `physical_region_size / side_length_mm / datapoints_per_mm` vs. source resolution.

### 3D Preview
- Small Three.js viewport (~200×200 px or resizable) embedded in the sidebar
- Renders a coarse 3D preview of the current selection rectangle's terrain
- Use downsampled elevation data (e.g. max 64×64 or 128×128 grid) for performance
- Update on region change (debounced, ~500 ms after user stops panning/resizing)
- Orbit controls for rotating the preview
- This is for visual reference only — not export quality

### Export
- "Download STL" button (primary action)
- "Download Heightmap PNG" button (secondary)
- Show estimated file size and grid dimensions before export

### Advanced (Collapsible, Closed by Default)
- All remaining configurable values: baseplate thickness, chamfer settings, text engraving options, vertical exaggeration, material properties (color, metalness, roughness), geometry type (plane/sphere/cylinder)
- Group logically with subtle section headers

## 2. Map Enhancements

- **Scale bar** — use Leaflet's built-in `L.control.scale()` if not already present. Show metric units.
- **Map scale ratio** — display the representative fraction (e.g. "1:300,000") updated on zoom/pan. Compute from current zoom level and latitude: `scale = 1 / (meters_per_pixel * pixels_per_mm_on_screen)`. Place this in a map corner overlay or in the sidebar near the region settings.
- **Selection rectangle** — must respect the chosen aspect ratio. When the user drags to resize, constrain proportionally. Show dimensions in mm on the rectangle edges.

## 3. Cleanup

- Audit all files for dead code, unused variables, unreachable routes, commented-out blocks. Remove them.
- Remove or gate behind a flag any features not in the routes/requirements above.
- Ensure consistent error handling — no silent failures on tile fetch errors; show a user-visible message.
- Check WebSocket reconnection logic — it should auto-reconnect with backoff.

## 4. Constraints

- **No bundler / build step.** All frontend code stays as ES modules loaded via CDN or served by Deno.
- **Maintain APN naming convention** for all new and modified variables.
- **Keep the existing STL pipeline logic** (`stl_pipeline.js`) unless there's a clear bug. The geometry and export code is working — focus refactoring on the UI layer.
- **Browser-only 3D and export** — no server-side rendering. The backend only serves files, manages DB, and proxies APIs if needed.
- **Responsive but desktop-first** — this is a local tool, not a mobile app. Sidebar can have a minimum width.

# Approach

1. **Start by auditing** — read every file, map dependencies, identify dead code and unused routes. Present a cleanup report before changing anything.
2. **Refactor the GUI** — restructure `o_component__unified.js` (or replace it) to implement the sidebar layout. Extract logical sections into sub-components if it reduces complexity.
3. **Add map enhancements** — scale bar, scale ratio, constrained selection rectangle.
4. **Add resolution indicator** — compute and display the source-vs-target resolution comparison.
5. **Add 3D preview** — embed a lightweight Three.js scene in the sidebar.
6. **Test each terrain source** — verify Global, Swiss, and Mars pipelines still work end-to-end after refactoring.

Present your plan and any clarifying questions before writing code. When you do write code, work in small, testable increments — one feature per commit.
````

---

## Prompt Design Rationale

- **Role + context up front** — grounds the LLM as a domain expert and prevents it from suggesting a framework migration or rewrite from scratch.
- **Codebase overview included** — so the LLM understands the existing architecture, file layout, and APN naming convention before proposing changes.
- **Requirements are hierarchical** — sidebar sections are specified in visual top-to-bottom order, making it unambiguous what goes where.
- **Resolution math is spelled out** — the source-vs-target resolution warning is the trickiest feature, so the computation formula is included to prevent incorrect implementations.
- **Constraints section** — explicitly prevents common LLM instincts like introducing a bundler, rewriting the working STL pipeline, or adding mobile-first CSS.
- **Phased approach** — mandates an audit before any code changes, preventing blind rewrites without understanding the existing codebase.
- **"Flag before deleting" for unused routes** — ensures the user stays in control of what gets removed.
