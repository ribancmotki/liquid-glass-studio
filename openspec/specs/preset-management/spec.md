# preset-management Specification

## Purpose
TBD - created by archiving change add-initial-specs. Update Purpose after archive.
## Requirements
### Requirement: Preset Export
The system SHALL allow users to export all current control parameter values as a JSON file with version, timestamp, and control data.

#### Scenario: Export to file
- **WHEN** the user clicks the export button
- **THEN** a JSON file named `liquid-glass-<timestamp>.json` is downloaded containing version "1.0.0", ISO timestamp, and a deep clone of all control values

### Requirement: Preset Import
The system SHALL allow users to import a previously exported preset JSON file, restoring all control parameter values.

#### Scenario: Successful import
- **WHEN** the user selects a valid preset JSON file
- **THEN** all control values are restored from the file via the Leva controls API
- **AND** a success message is displayed

#### Scenario: Invalid file
- **WHEN** the user selects a file that is not valid JSON or lacks required fields (version, controls)
- **THEN** an error message is displayed with the failure reason

