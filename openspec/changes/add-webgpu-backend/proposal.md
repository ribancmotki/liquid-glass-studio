# Change: Add WebGPU rendering backend with runtime toggle

## Why
WebGPU offers better performance, modern shader capabilities, and is the future of web graphics. Adding WebGPU as an alternative backend allows users with supporting browsers to benefit while preserving the existing WebGL2 path as default.

## What Changes
- **New**: Custom Leva toggle component for switching between WebGL2 and WebGPU backends
- **New**: WebGPU capability detection at startup
- **New**: `GPUUtils.ts` — WebGPU rendering utilities mirroring `GLUtils.ts` API (MultiPassRenderer, texture loading, video texture)
- **New**: WGSL shaders porting all 4 passes (bg, vblur, hblur, main) from GLSL — main pass implements STEP==9 final composition only
- **Modified**: `App.tsx` — Renderer abstraction to switch between WebGL2 and WebGPU backends
- **Modified**: `parameter-controls` spec — Renderer toggle control
- **Modified**: `glass-rendering` spec — WebGPU backend support

## Impact
- Affected specs: `glass-rendering`, `parameter-controls`
- Affected code: `src/App.tsx`, `src/Controls.tsx`, new `src/utils/GPUUtils.ts`, new `src/shaders-wgsl/`, new `src/components/LevaRendererToggle/`
- **BREAKING**: None — WebGL2 remains the default
