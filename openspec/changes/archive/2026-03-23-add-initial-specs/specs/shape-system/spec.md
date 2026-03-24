## ADDED Requirements

### Requirement: Superellipse Shape
The system SHALL render the primary glass shape as a rounded rectangle using superellipse corner SDF with configurable width (20–800), height (20–800), radius (1–100%), and roundness (2–7).

#### Scenario: Shape parameter adjustment
- **WHEN** the user adjusts shape width, height, radius, or roundness
- **THEN** the glass shape updates immediately to reflect the new parameters
- **AND** the roundness parameter controls the superellipse exponent (2=diamond-like, 4-5=squircle, 7=near-rectangle)

### Requirement: Secondary Circle Shape
The system SHALL optionally render a secondary circle shape at the center of the canvas, toggleable via the "Show 2nd Shape" control.

#### Scenario: Toggle secondary shape
- **WHEN** the user enables "Show 2nd Shape"
- **THEN** a circle with radius 100px (DPR-adjusted) appears at the canvas center
- **AND** it participates in shape merging with the primary shape

### Requirement: Shape Blob Merging
The system SHALL blend the primary and secondary shapes together using a smooth minimum (smin) function with configurable merge rate (0–0.3).

#### Scenario: Merge effect
- **WHEN** merge rate is greater than 0 and the secondary shape is enabled
- **THEN** the two shapes blend smoothly at their boundaries, creating an organic blob-like transition

#### Scenario: No merge
- **WHEN** merge rate is 0
- **THEN** the shapes remain separate with distinct boundaries

### Requirement: Mouse-Following Shape Position
The system SHALL position the primary shape at the pointer location on the canvas, using spring-based animation for smooth following.

#### Scenario: Mouse movement
- **WHEN** the user moves the pointer over the canvas
- **THEN** the primary shape follows the pointer with spring-based easing
- **AND** the spring velocity is tracked for animation morph effects

### Requirement: Spring-Based Size Animation
The system SHALL deform the shape size based on pointer movement speed, controlled by the animation morph factor (0–50).

#### Scenario: Fast movement
- **WHEN** the user moves the pointer quickly and the morph factor is greater than 0
- **THEN** the shape stretches in the direction of movement proportional to the speed and morph factor

### Requirement: Resizable Canvas Window
The system SHALL display the WebGL canvas in a resizable window that is centered on the viewport and adjustable via drag handles.

#### Scenario: Canvas resize
- **WHEN** the user drags the resize handle
- **THEN** the canvas dimensions update and the WebGL viewport/framebuffers resize accordingly
- **AND** the window re-centers after resize
