## 1. Renderer Abstraction Interface
- [x] 1.1 Define `IMultiPassRenderer` interface in `src/utils/RendererInterface.ts` with methods: `resize()`, `setUniform()`, `setUniforms()`, `render()`, `dispose()`
- [x] 1.2 Define `ITextureHandle` opaque type wrapping `WebGLTexture | GPUTexture`
- [x] 1.3 Define shared `RenderPassConfig` type and texture utility function signatures (`loadTextureFromURL`, `createEmptyTexture`, `updateVideoTexture`)

## 2. WebGPU Capability Detection
- [x] 2.1 Create `src/utils/gpuDetect.ts` with `detectWebGPU(): Promise<{ supported: boolean; reason?: string }>` that checks `navigator.gpu`, requests adapter, and validates device capabilities
- [x] 2.2 Call detection on app startup and store result in state

## 3. Renderer Toggle UI Component
- [x] 3.1 Reuse existing `LevaCheckButtons` component with two buttons: "WebGL" (always enabled) and "WebGPU" (disabled with tooltip when unsupported)
- [x] 3.2 Add i18n strings for the toggle in `src/utils/languages.ts` (all three locales)
- [x] 3.3 Integrate toggle into `src/Controls.tsx` in the basic settings folder, before the language selector

## 4. WGSL Shaders
- [x] 4.1 Create `src/shaders-wgsl/vertex.wgsl` — fullscreen quad vertex shader with UV output
- [x] 4.2 Create `src/shaders-wgsl/fragment-bg.wgsl` — background rendering with procedural patterns, texture sampling, cover-fit UV, shadow computation (port from `fragment-bg.glsl`)
- [x] 4.3 Create `src/shaders-wgsl/fragment-bg-vblur.wgsl` — vertical Gaussian blur (port from `fragment-bg-vblur.glsl`)
- [x] 4.4 Create `src/shaders-wgsl/fragment-bg-hblur.wgsl` — horizontal Gaussian blur (port from `fragment-bg-hblur.glsl`)
- [x] 4.5 Create `src/shaders-wgsl/fragment-main.wgsl` — glass effect composition: refraction, dispersion, Fresnel, glare, tint (port STEP==9 branch from `fragment-main.glsl`), SDF functions, LCH color space math

## 5. WebGPU Rendering Utilities
- [x] 5.1 Create `src/utils/GPUUtils.ts` with shader module creation via combined vertex+fragment WGSL
- [x] 5.2 Implement `GPUFrameBuffer` — manages `GPUTexture` (rgba16float color + depth24plus) with resize support
- [x] 5.3 Implement `GPURenderPassObj` — creates render pipeline, manages bind groups for uniforms + textures/samplers, fullscreen quad vertex buffer, and render execution
- [x] 5.4 Implement `GPUMultiPassRenderer` — orchestrates multi-pass rendering matching `IMultiPassRenderer` interface: constructor takes canvas + configs + device, manages global/per-pass uniforms, resolves inter-pass texture dependencies
- [x] 5.5 Implement `gpuLoadTextureFromURL()` for WebGPU — creates `GPUTexture` from image URL using `createImageBitmap` + `device.queue.copyExternalImageToTexture()`
- [x] 5.6 Implement `gpuCreateEmptyTexture()` for WebGPU — creates writeable `GPUTexture` for video frames
- [x] 5.7 Implement `gpuUpdateVideoTexture()` for WebGPU — copies video frame to texture using `copyExternalImageToTexture()`

## 6. App.tsx Integration
- [x] 6.1 Refactor `App.tsx` to use `IMultiPassRenderer` interface instead of direct `MultiPassRenderer` reference
- [x] 6.2 Add renderer backend state (webgl/webgpu) and WebGPU support detection result to `stateRef`
- [x] 6.3 Implement renderer swap logic: on toggle, dispose old renderer, create new renderer with appropriate backend
- [x] 6.4 Adapt texture handling to work with both backends (WebGLTexture vs GPUTexture)

## 7. Validation
- [ ] 7.1 Manual test: app loads with WebGL2 by default, toggle shows as "WebGL" active
- [ ] 7.2 Manual test: on WebGPU-capable browser, toggling to WebGPU re-initializes rendering with identical visual output
- [ ] 7.3 Manual test: on browser without WebGPU, the WebGPU button is disabled with appropriate tooltip
- [ ] 7.4 Manual test: all backgrounds (procedural, image, video, custom upload) work in WebGPU mode
- [ ] 7.5 Manual test: all parameter adjustments (refraction, Fresnel, glare, blur, tint, shadow, shape) work in WebGPU mode
- [ ] 7.6 Manual test: toggling back to WebGL2 from WebGPU restores rendering correctly
- [x] 7.7 Verify `pnpm build` succeeds without type errors
