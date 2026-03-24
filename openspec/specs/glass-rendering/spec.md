# glass-rendering Specification

## Purpose
TBD - created by archiving change add-initial-specs. Update Purpose after archive.
## Requirements
### Requirement: Multi-Pass Rendering Pipeline
The system SHALL render the glass effect using a four-pass WebGL2 pipeline: background pass, vertical blur pass, horizontal blur pass, and main composite pass.

#### Scenario: Pipeline initialization
- **WHEN** the application mounts and a canvas element is available
- **THEN** the system creates a `MultiPassRenderer` with four configured passes (bgPass, vBlurPass, hBlurPass, mainPass) using WebGL2
- **AND** the system requires the `EXT_color_buffer_float` extension for RGBA16F framebuffers

#### Scenario: Per-frame rendering
- **WHEN** a new animation frame fires
- **THEN** the system executes all four passes in order, passing global uniforms and per-pass uniforms
- **AND** intermediate pass outputs are connected as texture inputs to subsequent passes

#### Scenario: Canvas resize
- **WHEN** the canvas size changes
- **THEN** the system updates the GL viewport and resizes all framebuffer attachments to match the new dimensions

### Requirement: Glass Refraction Effect
The system SHALL simulate light refraction through a glass-like surface using SDF-derived normals and configurable thickness/factor parameters.

#### Scenario: Edge refraction
- **WHEN** a pixel is inside the glass shape (SDF < 0) and within the refraction thickness boundary
- **THEN** the system computes an edge factor from the incidence angle and refraction index
- **AND** offsets the texture sampling position by the SDF normal scaled by the edge factor

#### Scenario: Center of shape
- **WHEN** a pixel is inside the glass shape but beyond the refraction thickness
- **THEN** the edge factor is zero and the blurred background is sampled without offset

### Requirement: Chromatic Dispersion
The system SHALL simulate chromatic dispersion by sampling R, G, B channels at slightly different UV offsets based on configurable dispersion gain.

#### Scenario: Dispersion active
- **WHEN** the refraction dispersion parameter is greater than zero
- **THEN** the red, green, and blue channels are sampled at UV positions scaled by per-channel refractive indices (N_R=0.98, N_G=1.0, N_B=1.02) multiplied by the dispersion factor

### Requirement: Fresnel Reflection
The system SHALL render a Fresnel reflection effect that increases brightness near the edges of the glass shape.

#### Scenario: Fresnel at edges
- **WHEN** a pixel is near the glass edge (within Fresnel range)
- **THEN** the system blends toward white/tinted color based on a power-curve Fresnel factor
- **AND** the factor is controlled by Fresnel range, hardness, and intensity parameters

### Requirement: Glare Effect
The system SHALL render a directional glare/specular highlight on the glass surface based on the surface normal angle relative to a configurable glare direction.

#### Scenario: Glare rendering
- **WHEN** a pixel is inside the glass shape with a non-zero edge factor
- **THEN** the system computes a glare angle factor from the normal direction and glare angle uniform
- **AND** blends toward a bright LCH-lightened color, modulated by glare geometry factor, angle factor, convergence, and opposite-side factor

### Requirement: Gaussian Blur
The system SHALL apply separable Gaussian blur to the background using two passes (vertical then horizontal) with a configurable radius up to 200 pixels.

#### Scenario: Blur computation
- **WHEN** blur radius is set to a value between 1 and 200
- **THEN** the system computes a Gaussian kernel (sigma = radius/3) and uploads weights as a uniform array
- **AND** the vertical and horizontal blur shaders sample neighboring texels weighted by the kernel

### Requirement: DPR-Aware Rendering
The system SHALL render at the device pixel ratio to ensure sharp output on high-DPI displays.

#### Scenario: High-DPI display
- **WHEN** the device pixel ratio is greater than 1
- **THEN** the canvas backing store is scaled by DPR and all SDF/shape computations account for the DPR uniform

### Requirement: Debug Step Visualization
The system SHALL support a debug step mode (0-9) that visualizes intermediate rendering stages including SDF fields, normals, edge factors, blur, refraction, Fresnel, and glare individually.

#### Scenario: Step selection
- **WHEN** the STEP uniform is set to a value between 0 and 9
- **THEN** the main shader outputs the corresponding intermediate visualization instead of the full composite

