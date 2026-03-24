## Context
The current rendering pipeline is tightly coupled to WebGL2 via `GLUtils.ts` (ShaderProgram, FrameBuffer, RenderPass, MultiPassRenderer) and GLSL shaders. Adding WebGPU requires a parallel set of utilities with an identical public interface so `App.tsx` can switch between backends at runtime.

### Key Architectural Differences: WebGL2 vs WebGPU

| Aspect | WebGL2 | WebGPU |
|--------|--------|--------|
| Context | `canvas.getContext('webgl2')` | `navigator.gpu.requestAdapter()` → `adapter.requestDevice()` → `context.configure()` |
| Shader Language | GLSL ES 3.0 | WGSL |
| Pipeline | Stateful (bind program, set uniforms, draw) | Pipeline objects (immutable config), bind groups |
| Uniforms | Individual `gl.uniform*()` calls | Uniform buffers (GPUBuffer) + bind groups |
| Textures | `gl.bindTexture()` + `gl.activeTexture()` | GPUTexture + GPUSampler + bind group entries |
| Framebuffers | FBO + texture attachment | Render pass descriptor with color/depth attachments |
| Render Loop | Bind FBO → use program → set uniforms → draw → unbind | Command encoder → render pass → set pipeline/bindings → draw → submit |
| Float Textures | Requires `EXT_color_buffer_float` | Native `rgba16float` format support |
| Array Uniforms | `gl.uniform1fv()` | Packed into uniform buffer with proper alignment (std140/WGSL rules) |
| Texture Origin | Bottom-left (UV y=0 at bottom) | Top-left (UV y=0 at top) |
| `asin()` OOB | Silent clamp (implementation-defined) | Returns NaN (strict) |
| `textureSample` | Allowed anywhere | Requires uniform control flow |
| Canvas alpha | Default opaque compositing | Must set `alphaMode: 'opaque'` explicitly |

## Goals / Non-Goals
- **Goals**:
  - Provide an identical visual result via WebGPU backend (STEP==9 final composition)
  - Create `GPUMultiPassRenderer` with same public API shape as `MultiPassRenderer`
  - Runtime toggle between WebGL2 and WebGPU without page reload
  - Graceful degradation: disable WebGPU option when unavailable
- **Non-Goals**:
  - WebGPU-exclusive features (compute shaders, storage buffers for advanced effects)
  - Debug STEP visualization (0-8) in WebGPU — only STEP==9 (final output)
  - Performance optimization beyond feature parity (no WebGPU compute-based blur, etc.)

## Decisions

### 1. Renderer Abstraction Strategy
**Decision**: Define a common `IMultiPassRenderer` TypeScript interface and implement it for both backends. `App.tsx` holds a ref to the active renderer and swaps it on toggle.

**Why**: Minimal change to App.tsx. The renderer is already accessed through a single variable; adding an interface formalizes the contract.

### 2. Uniform Buffer Layout (WebGPU)
**Decision**: Use a single global uniform buffer (binding 0) for all scalar/vector uniforms, and separate bind group entries for textures/samplers. Per-pass uniforms are merged and re-uploaded each frame (same pattern as WebGL).

**Why**: Matches the current pattern where uniforms are set every frame. No caching needed since values change constantly.

**Layout**: WGSL struct with explicit alignment matching the uniform upload order. Float arrays (blur weights) go into a separate storage buffer due to WGSL array alignment requirements.

### 3. WGSL Shader Organization
**Decision**: One `.wgsl` file per pass, stored in `src/shaders-wgsl/`. Shared SDF/color utility functions are duplicated per file (WGSL has no `#include`).

**Why**: WGSL lacks a preprocessor. Duplication across 4 files is manageable; shared code is ~80 lines of SDF math + color space functions.

### 4. Texture Handling
**Decision**: Mirror the WebGL texture API: `loadTextureFromURL()` returns `{ texture: GPUTexture, ratio }`, `createEmptyTexture()` and `updateVideoTexture()` work similarly but use `device.queue.copyExternalImageToTexture()` for video frames.

**Why**: WebGPU has native external image copy which is more efficient than texImage2D for video.

**Important implementation details**:
- `createImageBitmap()` must use default `colorSpaceConversion` (not `'none'`) for correct sRGB color matching with WebGL
- `copyExternalImageToTexture` must use `flipY: false` because the vertex shader already flips `v_uv.y`
- `bitmap.close()` invalidates `bitmap.width/height` — dimensions must be captured before closing

### 5. Canvas Swap on Toggle
**Decision**: On backend toggle, use React's `key` prop to force React to unmount and remount the `<canvas>` element, giving a fresh DOM element with no prior graphics context.

**Why**: A canvas can only have one context type. Imperative DOM replacement (`replaceChild`) breaks React's internal tracking — the replaced element becomes orphaned (no `parentNode`). Using React's `key` mechanism is the correct declarative approach.

**Implementation**: A `canvasKey` state counter increments on each backend switch. The backend-switch effect depends on `canvasKey` and fires after React has mounted the new canvas. It must then immediately apply `canvasInfo` dimensions to the fresh canvas (which starts at the default 300×150) and call `renderer.resize()`.

### 6. WGSL Coordinate System Adaptation
**Decision**: Flip `v_uv.y` in the WGSL vertex shader so that `v_uv=(0,0)` maps to the top-left, matching WebGPU's texture/framebuffer origin. Use `pixel = vec2f(frag_coord.x, resolution.y - frag_coord.y)` for SDF computations that need GLSL-style bottom-up coordinates.

**Why**: WebGPU textures have origin at top-left, but the SDF math and mouse coordinates are in bottom-up convention. Flipping `v_uv` in the vertex shader ensures correct inter-pass texture sampling, while `pixel` provides GLSL-compatible coordinates for SDF.

**Implications**:
- Procedural background patterns use `gl_uv = vec2f(v_uv.x, 1.0 - v_uv.y)` for GLSL-convention UV checks
- Refraction normal offsets must negate the Y component when applied to `v_uv`: `vec2f(offset.x, -offset.y)`
- External texture uploads use `flipY: false` (the vertex UV flip handles orientation)

### 7. WGSL Numerical Robustness
**Decision**: Clamp `asin()` inputs to `[-1, 1]` and use `safeNormalize()` instead of `normalize()` for potentially-zero vectors.

**Why**: WGSL is stricter than GLSL — `asin(>1)` returns NaN (GLSL silently clamps), and `normalize(vec2(0))` produces NaN/Inf. These NaN values propagate through `mix()`, `clamp()`, and color calculations, producing black pixels at shape edges.

## Risks / Trade-offs
- **Risk**: Visual differences between WebGL and WebGPU due to floating point precision or texture filtering differences → **Mitigation**: Compare visually; both use same algorithm logic
- **Risk**: WebGPU API still evolving → **Mitigation**: Target stable Chrome/Edge/Safari WebGPU APIs only
- **Risk**: WGSL uniform alignment bugs → **Mitigation**: Explicit byte offset tracking in uniform buffer upload
- **Risk**: Video texture performance in WebGPU → **Mitigation**: Use `copyExternalImageToTexture` which is hardware-accelerated
- **Risk**: GLSL `mat3` column-major ordering confusion when porting to WGSL → **Mitigation**: Documented clearly in shader comments; verified visually against WebGL output

## Open Questions
- None — all identified issues have been resolved
