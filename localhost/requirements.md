# Requirements

## Data Sources

| Source | Coverage | Resolution | Provider |
|--------|----------|------------|----------|
| swissALTI3D | Switzerland only | 0.5m | swisstopo API |
| Global (SRTM) | Full world | ~30m | NASA / AWS Terrarium tiles |
| Mars (MOLA) | Mars | ~463m | AWS Terrarium tiles |

## GUI

- The map should by default show a topographic image layer
- Tiling should not be an overlay but an input parameter for the 3D export pipeline

## Map Interface

- Interactive pan/zoom with Leaflet
- Terrain source selector (Global / Switzerland / Mars)
- Location search (Nominatim for global, swisstopo API for Switzerland)
- Selection rectangle for cropping the export area
- Aspect ratio presets (free, 1:1, 4:3, 16:9, portrait)
- Elevation overlay toggle
- Zoom level info display

## 3D Model Generation

- Heightmap generation from elevation tiles (RGB-encoded → meters)
- Vertex displacement on plane, sphere, or cylinder geometry
- Configurable baseplate thickness (minimum 10mm enforced)
- Chamfered edges for 3D printing
- Optional text engraving with adjustable depth
- Material properties (color, metalness, roughness)
- Tiling support for large area processing

## Export

- STL binary export for 3D printing
- PNG heightmap export

## Additional Features

- Grayscale image to 3D converter (standalone page)
- Swiss landslide/natural disaster event catalog with coordinates
