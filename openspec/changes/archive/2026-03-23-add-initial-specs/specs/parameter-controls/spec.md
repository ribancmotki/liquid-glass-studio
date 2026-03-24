## ADDED Requirements

### Requirement: Leva Parameter Panel
The system SHALL provide a real-time parameter editor using Leva with controls organized into logical groups (basic settings, shape settings, animation settings, debug settings).

#### Scenario: Parameter adjustment
- **WHEN** the user adjusts any slider, checkbox, or color picker in the Leva panel
- **THEN** the corresponding shader uniform is updated on the next animation frame
- **AND** the glass effect reflects the change immediately

### Requirement: Refraction Controls
The system SHALL expose controls for glass refraction: thickness (1–80), refraction factor (1–4), and dispersion gain (0–50).

#### Scenario: Refraction parameter range
- **WHEN** the user adjusts refraction thickness
- **THEN** the value is clamped between 1 and 80 with step 0.01

### Requirement: Fresnel Controls
The system SHALL expose controls for Fresnel reflection: range (0–100), hardness (0–100), and intensity (0–100).

#### Scenario: Fresnel parameter adjustment
- **WHEN** the user adjusts Fresnel range
- **THEN** the value is clamped between 0 and 100 with step 0.01

### Requirement: Glare Controls
The system SHALL expose controls for glare: range (0–100), hardness (0–100), convergence (0–100), opposite side factor (0–100), intensity (0–120), and angle (-180 to 180 degrees).

#### Scenario: Glare angle adjustment
- **WHEN** the user adjusts the glare angle
- **THEN** the directional highlight rotates smoothly in real time

### Requirement: Blur Controls
The system SHALL expose blur radius (1–200, integer step) and blur edge toggle.

#### Scenario: Blur edge toggle
- **WHEN** blur edge is enabled
- **THEN** the entire glass interior uses the blurred background
- **WHEN** blur edge is disabled
- **THEN** the blur-to-clear mix is proportional to the edge height within the glass

### Requirement: Tint Control
The system SHALL expose an RGBA color picker for glass tint that blends over the refracted background.

#### Scenario: Tint application
- **WHEN** the user sets a tint with alpha > 0
- **THEN** the glass surface shows a colored overlay at the specified opacity

### Requirement: Shadow Controls
The system SHALL expose shadow expand (2–100), shadow intensity (0–100), and shadow position (2D vector with ±20 range).

#### Scenario: Shadow rendering
- **WHEN** shadow intensity is greater than 0
- **THEN** a soft shadow appears beneath the glass shape, offset by the shadow position vector

### Requirement: Internationalization
The system SHALL support language switching between English (en-US), Simplified Chinese (zh-CN), and Uzbek (uz-UZ) with auto-detection of browser language.

#### Scenario: Language auto-detection
- **WHEN** the application loads
- **THEN** the UI language is set to Chinese if the browser language starts with "zh", Uzbek if it starts with "uz", and English otherwise

#### Scenario: Manual language switch
- **WHEN** the user selects a different language
- **THEN** all control labels and UI strings update immediately
