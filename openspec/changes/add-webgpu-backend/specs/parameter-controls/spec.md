## ADDED Requirements

### Requirement: Renderer Backend Toggle
The system SHALL display a custom Leva toggle component in the basic settings panel allowing the user to switch between WebGL2 and WebGPU rendering backends. WebGL2 SHALL be selected by default.

#### Scenario: WebGPU available
- **WHEN** WebGPU capability detection succeeds (async, after app mount)
- **THEN** the toggle updates reactively: the "WebGPU" button transitions from disabled to enabled
- **AND** clicking "WebGPU" switches the rendering backend
- **AND** the Leva `useControls` dependency array includes `webgpuSupported` to ensure the toggle re-renders when detection completes

#### Scenario: WebGPU unavailable
- **WHEN** WebGPU capability detection fails
- **THEN** the "WebGPU" button is disabled (grayed out, `cursor: not-allowed` instead of `pointer-events: none` to allow tooltip display)
- **AND** hovering over the disabled button shows a tooltip with the unavailability reason in the current locale

#### Scenario: Toggle i18n
- **WHEN** the UI language changes
- **THEN** the toggle label and tooltip text update to the current locale (en-US: "Renderer", zh-CN: "渲染引擎", uz-UZ: "Renderer")
