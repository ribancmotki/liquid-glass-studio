# background-system Specification

## Purpose
TBD - created by archiving change add-initial-specs. Update Purpose after archive.
## Requirements
### Requirement: Procedural Backgrounds
The system SHALL provide built-in procedural background patterns: checkerboard grid, directional bars, and half-tone split.

#### Scenario: Default background
- **WHEN** the application loads with bgType=0
- **THEN** a checkerboard pattern is rendered as the background

### Requirement: Image Backgrounds
The system SHALL support loading bundled image backgrounds (Tahoe light, buildings, text, Tim Cook, UI mockup) as WebGL textures with cover-fit UV mapping.

#### Scenario: Image background selection
- **WHEN** the user selects an image background
- **THEN** the image is loaded as a texture, cover-fitted to the canvas aspect ratio, and rendered behind the glass effect

### Requirement: Video Backgrounds
The system SHALL support bundled video backgrounds (fish, traffic, flower) that play in a loop and update the GPU texture each frame.

#### Scenario: Video background playback
- **WHEN** the user selects a video background
- **THEN** the video plays in a loop (muted, inline) and each frame is uploaded to the GPU texture
- **AND** the video is cover-fitted to the canvas aspect ratio

#### Scenario: Video pause on switch
- **WHEN** the user switches away from a video background
- **THEN** the previous video is paused

### Requirement: Custom Media Upload
The system SHALL allow users to upload custom images or videos as backgrounds via a file picker.

#### Scenario: Custom image upload
- **WHEN** the user uploads an image file
- **THEN** the image is loaded as a texture and used as the background

#### Scenario: Custom video upload
- **WHEN** the user uploads a video file
- **THEN** the video plays in a loop and each frame is used as the background texture

### Requirement: Background Shadow
The system SHALL render a soft shadow on the background beneath the glass shape, with configurable expand, intensity, and position offset.

#### Scenario: Shadow computation
- **WHEN** the background pass runs
- **THEN** the shadow is computed using `exp(-1/expand * |sdf| * resolution) * 0.6 * factor` and subtracted from the background color

