# Project Context

## Purpose
Liquid Glass Studio is a web-based interactive tool that recreates Apple's Liquid Glass UI effects using WebGL2 / WebGPU and custom shaders (GLSL / WGSL). Users can manipulate glass effect parameters in real-time through a visual editor, preview effects on various backgrounds, and export/import parameter presets.

## Tech Stack
- **Language**: TypeScript (strict mode, ES2020 target)
- **Framework**: React 19 + Vite 6
- **Rendering**: WebGL2 (GLSL ES 3.0) / WebGPU (WGSL) dual-backend, runtime switchable
- **UI Controls**: [Leva](https://github.com/pmndrs/leva) for parameter panels, with custom components
- **Animation**: @react-spring/web for spring-based animations
- **Styling**: SCSS (modules + global), clsx for classname composition
- **UI Components**: MUI Material Icons, re-resizable
- **Package Manager**: pnpm
- **Path Aliases**: `@` → `src/` (via tsconfig paths + vite-tsconfig-paths)

## Project Conventions

### Code Style
- Strict TypeScript with `erasableSyntaxOnly`
- ESLint with React Hooks and React Refresh plugins
- Prettier with GLSL plugin for shader formatting
- Component files: PascalCase (e.g., `ResizableWindow.tsx`)
- Utility files: camelCase (e.g., `presetUtils.ts`)
- Shader files: kebab-case with descriptive names (e.g., `fragment-main.glsl`)
- SCSS modules for component-scoped styles (`.module.scss`)
- Chinese comments are common in shader and GL utility code

### Architecture Patterns
- **Single-page app** with a monolithic `App.tsx` that owns the WebGL rendering loop
- **Multi-pass rendering pipeline**: Background → Vertical Blur → Horizontal Blur → Main composite
- **Ref-based state** (`stateRef`) for render-loop data that doesn't trigger React re-renders
- **Leva controls** as the primary UI, with custom Leva components (`LevaContainer`, `LevaCheckButtons`, `LevaVectorNew`, `LevaButton`)
- **Shader uniforms** driven directly by Leva control values each frame
- All shader programs share a common vertex shader (fullscreen quad)
- SDF-based shape rendering with smooth merge (smin) for blob effects

### Rendering Pipeline
1. **bgPass**: Renders background (procedural patterns or texture/video) + shadow
2. **vBlurPass**: Vertical Gaussian blur of bgPass output
3. **hBlurPass**: Horizontal Gaussian blur of vBlurPass output
4. **mainPass**: Composites glass effect (refraction, dispersion, Fresnel, glare) on top of blurred/unblurred background; uses `STEP` uniform for debug visualization

### Testing Strategy
- No automated tests currently exist
- Manual testing via the interactive UI
- Debug `STEP` control (0-9) for visualizing intermediate rendering stages

### Git Workflow
- Main branch development
- Deployed to Vercel (liquid-glass-studio.vercel.app)

## Domain Context
- **SDF (Signed Distance Function)**: Mathematical function returning distance to shape boundary; negative inside, positive outside
- **Superellipse**: Generalization of ellipse with adjustable roundness parameter
- **Smooth min (smin)**: Blends two SDF shapes together smoothly (blob/merge effect)
- **Fresnel reflection**: Light reflection increases at glancing angles
- **Dispersion**: Chromatic separation of light into RGB channels
- **Glare**: Directional light effect controlled by angle and convergence
- **Multi-pass Gaussian blur**: Separable blur done in two passes (H + V) for performance
- **LCH color space**: Used for perceptually uniform color blending in glare/fresnel tinting

## Important Constraints
- WebGL2 is the default backend; WebGPU is available on supported browsers (Chrome 113+, Edge 113+, Safari 18+)
- WebGL2 backend requires `EXT_color_buffer_float` extension for HDR framebuffers (RGBA16F)
- WebGPU backend uses native `rgba16float` format for intermediate framebuffers
- WebGL and WebGPU contexts are mutually exclusive on a canvas; switching backends remounts the canvas element via React `key`
- Shader uniform arrays limited to MAX_BLUR_RADIUS=200
- All rendering is in a single `requestAnimationFrame` loop
- Canvas size affects GPU workload; DPR-aware rendering

## External Dependencies
- Vercel for deployment
- No backend or API dependencies
- All assets (images, videos) bundled in `src/assets/`

## Key Files
- `src/App.tsx` — Main application, rendering loop, WebGL setup
- `src/Controls.tsx` — All Leva parameter definitions
- `src/utils/GLUtils.ts` — WebGL abstraction (ShaderProgram, FrameBuffer, RenderPass, MultiPassRenderer)
- `src/shaders/fragment-main.glsl` — Core glass effect shader
- `src/shaders/fragment-bg.glsl` — Background + shadow shader
- `src/shaders/fragment-bg-vblur.glsl` / `fragment-bg-hblur.glsl` — Separable Gaussian blur
- `src/shaders/vertex.glsl` — Shared fullscreen quad vertex shader
- `src/utils/presetUtils.ts` — Preset export/import logic
- `src/utils/languages.ts` — i18n strings (zh-CN, en-US, uz-UZ)
