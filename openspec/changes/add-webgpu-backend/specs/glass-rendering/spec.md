## MODIFIED Requirements

### Requirement: Multi-Pass Rendering Pipeline
The system SHALL render the glass effect using a four-pass pipeline: background pass, vertical blur pass, horizontal blur pass, and main composite pass. The pipeline SHALL support two rendering backends — WebGL2 (default) and WebGPU — both implementing the same `IMultiPassRenderer` interface.

#### Scenario: Pipeline initialization (WebGL2)
- **WHEN** the application mounts with the WebGL2 backend selected (default)
- **THEN** the system creates a `MultiPassRenderer` with four configured passes (bgPass, vBlurPass, hBlurPass, mainPass) using WebGL2
- **AND** the system requires the `EXT_color_buffer_float` extension for RGBA16F framebuffers

#### Scenario: Pipeline initialization (WebGPU)
- **WHEN** the application mounts or switches to the WebGPU backend
- **THEN** the system creates a `GPUMultiPassRenderer` with four configured passes using WebGPU
- **AND** the system uses `rgba16float` texture format for intermediate framebuffers
- **AND** WGSL shaders are used for all passes
- **AND** the canvas context is configured with `alphaMode: 'opaque'` to match WebGL canvas behavior

#### Scenario: Per-frame rendering
- **WHEN** a new animation frame fires
- **THEN** the active renderer executes all four passes in order, passing global uniforms and per-pass uniforms
- **AND** intermediate pass outputs are connected as texture inputs to subsequent passes

#### Scenario: Canvas resize
- **WHEN** the canvas size changes
- **THEN** the active renderer updates its viewport and resizes all framebuffer attachments to match the new dimensions

#### Scenario: Backend switch at runtime
- **WHEN** the user toggles the rendering backend
- **THEN** the system disposes the current renderer, forces React to remount the canvas element via a `key` change (since WebGL and WebGPU contexts are mutually exclusive on a single canvas), and initializes the new backend
- **AND** all current parameter values are preserved across the switch
- **AND** the new canvas element is immediately sized to match the current `canvasInfo` dimensions (avoiding the default 300×150 canvas size)
- **AND** the current background texture URL is temporarily cleared and restored via `requestAnimationFrame` so the render loop detects a change and reloads the texture for the new backend

## ADDED Requirements

### Requirement: WebGPU Backend
The system SHALL provide a WebGPU rendering backend (`GPUMultiPassRenderer`) that implements the same multi-pass rendering pipeline as the WebGL2 backend, producing visually identical output for the final composition (STEP==9 equivalent).

#### Scenario: WebGPU rendering
- **WHEN** the WebGPU backend is active
- **THEN** the system renders all four passes using WGSL shaders, GPUTextures for framebuffers, and uniform buffers for parameter data
- **AND** the visual output matches the WebGL2 backend's STEP==9 final composition

#### Scenario: WGSL texture sampling
- **WHEN** WGSL shaders sample textures
- **THEN** they use `textureSampleLevel(..., 0.0)` instead of `textureSample` to avoid WebGPU's uniform control flow restriction on `textureSample` (which cannot be called in branches that depend on non-uniform values like `frag_coord`)

#### Scenario: WGSL coordinate conventions
- **WHEN** WGSL shaders render to framebuffers
- **THEN** the vertex shader flips `v_uv.y` (`out.uv.y = 1.0 - uv.y`) so that `v_uv=(0,0)` maps to the top-left of the texture, matching WebGPU's texture/framebuffer origin convention
- **AND** fragment shaders that need GLSL-style bottom-up pixel coordinates compute `pixel = vec2f(frag_coord.x, resolution.y - frag_coord.y)`
- **AND** refraction normal offsets have their Y component negated when applied to `v_uv` sampling coordinates

#### Scenario: WGSL numerical safety
- **WHEN** WGSL shaders compute refraction or glare effects
- **THEN** `asin()` arguments are clamped to `[-1, 1]` to prevent NaN (WGSL returns NaN for out-of-range `asin`, unlike GLSL which silently clamps)
- **AND** `normalize()` on potentially-zero vectors is replaced with a safe variant that returns `vec2f(0)` instead of NaN

#### Scenario: WGSL color space conversion
- **WHEN** WGSL shaders perform sRGB↔LCH color space conversion
- **THEN** the RGB↔XYZ matrix constants are stored as true column vectors matching the GLSL `mat3` column-major layout (column 0 = first three constructor args, not the first element of each row)

#### Scenario: WebGPU texture loading
- **WHEN** an image background is selected in WebGPU mode
- **THEN** the system loads the image via `Image` element (supporting all browser image formats including SVG), then converts to bitmap via `createImageBitmap(img)` (with default `colorSpaceConversion` for correct sRGB handling), and copies it to a `GPUTexture` using `copyExternalImageToTexture` with `flipY: false` (since `v_uv.y` is already flipped in the vertex shader)
- **AND** bitmap dimensions are captured before `bitmap.close()` to compute the correct aspect ratio

#### Scenario: WebGPU video texture
- **WHEN** a video background is playing in WebGPU mode
- **THEN** each frame is converted via `createImageBitmap(video)` for consistent sRGB color handling, then copied to the GPU texture using `copyExternalImageToTexture` with `flipY: false`
- **AND** when the video dimensions change, the old texture is destroyed only after the new texture is created and written to, preventing "destroyed texture used in submit" errors
- **AND** the updated `GPUTexture` reference is returned to the caller since texture recreation produces a new object

### Requirement: WebGPU Capability Detection
The system SHALL detect WebGPU support at startup by checking `navigator.gpu`, requesting an adapter, and validating device capabilities.

#### Scenario: WebGPU supported
- **WHEN** the browser supports WebGPU and a GPU adapter is available
- **THEN** the detection returns `{ supported: true }` and the WebGPU toggle option is enabled

#### Scenario: WebGPU not supported
- **WHEN** the browser does not support WebGPU or no adapter is available
- **THEN** the detection returns `{ supported: false, reason: "..." }` and the WebGPU toggle option is disabled

### Requirement: Renderer Interface Abstraction
The system SHALL define an `IMultiPassRenderer` TypeScript interface that both `MultiPassRenderer` (WebGL2) and `GPUMultiPassRenderer` (WebGPU) implement, ensuring the rendering loop in App.tsx is backend-agnostic.

#### Scenario: Interface compliance
- **WHEN** a renderer is created (either WebGL2 or WebGPU)
- **THEN** it implements `resize()`, `setUniform()`, `setUniforms()`, `render()`, and `dispose()` methods with compatible signatures
