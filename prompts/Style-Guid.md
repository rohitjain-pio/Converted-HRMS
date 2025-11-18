# Prompt for Generating Comprehensive UI Migration Documentation for Legacy HRMS App

## Context

You are tasked with generating **highly detailed UI migration documentation** for a legacy HRMS application. The legacy app frontend is built in React with external UI libraries such as Acertinity and Material-UI (MUI). Backend and database code exist but are **out of scope** — this documentation focuses **exclusively on UI** aspects to guide a migration from React to Vue.js **without losing original UI and UX fidelity**.

---

## Legacy Project Structure (For Context and Folder Analysis)

- `@Legacy-Folder/Backend` → .NET backend API code (ignore for UI documentation)
- `@Legacy-Folder/Frontend` → React frontend code (**primary analysis target**)
- `@Legacy-Folder/Backend/hrms-backend/HRMSWebApi/database/` → legacy database schema (ignore for UI docs)

---

## Migration Goals (UI Focus)

- Frontend migration from React to Vue.js
- Preserve all UI layouts, styles, themes, and UX workflows exactly
- Handle external UI components (Acertinity, MUI) carefully in Vue.js context
- Prevent any UI glitches, visual bugs, or regressions during migration
- Generate modular, detailed UI documentation for each module of the app

---

## Modules to Document (Process All)

- 01-authentication-authorization.md
- 02-employee-management-part1.md
- 02-employee-management-part2.md
- 02-employee-management-part3.md
- 02-employee-management-part4.md
- 02-employee-management-part5.md
- 03-attendance-management.md
- 04-exit-management-part1.md
- 04-exit-management-part2.md
- 04-exit-management-part3.md
- 04-exit-management-part4.md
- 05-asset-management-part1.md
- 05-asset-management-part2.md
- 05-asset-management-part3.md
- 06-company-policy-management-part1.md
- 06-company-policy-management-part2.md
- 06-company-policy-management-part3.md
- 07-time-doctor-integration.md
- 08-leave-management.md
- 09-holiday-management.md
- 10-role-permission-management.md
- 11-reporting-analytics.md
- 12-audit-trail-logging.md
- 12-grievance-management.md

---

## Documentation Requirements Per Module

For each module, generate a dedicated **comprehensive UI migration document** in Markdown format containing the following detailed sections:

### 1. Module Overview
- High-level description of the module's UI purpose, scope, and user scenarios.
- Key workflows and interaction goals from a UI/UX perspective.
- UI-specific constraints or design principles to respect.

### 2. UI Component Inventory
- Exhaustive list of React components used in the module.
- Details on external UI libraries/components employed (e.g., Acertinity, MUI), including exact usage and customization.
- Description of styling methods in use (CSS modules, styled-components, inline styles, theme providers).
- Notes on custom UI utilities or helpers.

### 3. Component Structure & Hierarchy
- Detailed component tree showing parent-child relationships relevant to UI.
- For each component, list key props and UI-related state (ignore business logic state).
- Highlight reusable UI components vs one-time usage components.
- Illustrate layout containers and their role in overall UI structure.

### 4. Visual & UX Design Details
- Precise layout techniques (flexbox, grid, CSS positioning) used per major UI section.
- Detailed style properties: spacing (margin, padding), color schemes, font families, sizes, and weights.
- Theming approach and dynamic style applications (dark mode, user preferences).
- Responsive design breakpoints, behavior, and adaptations.
- UI feedback and status indicators (loaders, tooltips, validation messages, error displays).
- Animations, transitions, or other visual effects (describe triggers and purpose).

### 5. Interaction Patterns & Accessibility
- Comprehensive description of UI event handling (clicks, hovers, keyboard navigation).
- Focus management for accessibility (tab order, ARIA attributes, screen reader considerations).
- Modal/dialog implementations, overlay behavior, and dismissal patterns.
- Integration details for external UI components/widgets and any UI caveats or workarounds.
- Keyboard shortcuts or gesture support if any.

### 6. Migration Considerations (Vue.js UI Focus)
- Challenges in porting React UI patterns to Vue.js equivalents (props, slots, reactive bindings).
- Strategies for replacing or adapting external UI libs (Acertinity, MUI) in Vue.js ecosystem.
- Recommendations to maintain styling consistency and theme preservation.
- Potential UI glitch risks and how to mitigate them during migration.
- Suggestions for modularizing Vue components for better maintainability and reusability.

### 7. Visual Reference & Debugging Notes
- Annotated screenshots or wireframes of key UI states (if available).
- Highlight known UI/UX pain points or areas prone to bugs.
- Debugging tips or checklist for UI validation post-migration.

---

## Additional Instructions

- If generated documentation exceeds 1500 tokens, break the output into multiple parts and continue in subsequent outputs, clearly marking the continuation.
- Use **clear, structured Markdown** with headings, bullet points, tables, and code blocks where appropriate.
- Include **Vue.js component skeletons** and **style snippet examples** strictly related to UI rendering when relevant.
- Strictly avoid backend, routing, business logic, and state management details unrelated to UI rendering.
- Clearly distinguish between legacy React UI elements and their Vue.js migration recommendations.
- Ensure all UI aspects are covered thoroughly so there is no room for UI bugs or regression during migration.

---

## Final Task

**Analyze the entire frontend codebase inside `@Legacy-Folder/Frontend` module-wise as per the modules listed, and generate the comprehensive UI migration documentation with the above structure and detail level for each module.**

---

# End of prompt
