# Prompt: Integrate UI Design Docs with Logical & Functional Docs for Complete Implementation Planning

## Context

You are tasked to **merge two parallel documentation sets** for a legacy HRMS migration project:

1. **UI Design Documentation**
   - Created separately (covers layouts, components, UX, and design guidelines)
   - Focuses on frontend React → Vue.js migration from a visual and interaction standpoint
   - Located inside: `docs/ui-design/`
2. **Logical & Functional Documentation**
   - Located inside: `docs/modules/`
   - Covers API integrations, routing, state management, validations, business logic, and backend data flow (for .NET → Laravel migration)

Both sets belong to the same modules.  
The goal is to **synchronize these two sources** and produce **fully integrated module-wise implementation blueprints** for smooth development and migration.

---

## Project Structure References

- `@Legacy-Folder/Backend` → .NET API code  
- `@Legacy-Folder/Frontend` → React frontend (main UI reference)  
- `@Legacy-Folder/Backend/hrms-backend/HRMSWebApi/database/` → Database schema reference  
- `docs/module/` → Current functional & logical documentation  
- `docs/ui/` or equivalent → UI/UX migration documentation (React → Vue.js)

---

## Integration Objective

Generate **comprehensive, implementation-ready documentation** that combines:

- UI/UX design documentation (from your new design docs)
- Logic & functionality documentation (from `docs/module/`)
- Backend schema mapping (from existing database schema references)

The merged documentation should form a **single cohesive implementation plan** for each module, structured to guide developers step-by-step during the migration.

---

## Output Requirements per Module

For each module, generate a unified `.md` document named:
`[module-name]-implementation-blueprint.md`

Each module’s merged documentation must include the following structured sections:

---

### 1. **Module Overview**
- Combined summary of purpose (from logic doc) + user-facing goals (from UI doc).
- High-level workflow overview — what this module achieves and how UI and logic interact.
- Dependencies on other modules or shared components.

---

### 2. **UI & UX Summary (from UI Docs)**
- Key layouts, views, and component hierarchies.
- Visual elements, color themes, and user interaction patterns.
- Notes on external UI libraries (MUI, Acertinity) and how they integrate with logic.

---

### 3. **Functional & Logical Summary (from Functional Docs)**
- Key functionalities, business logic, and validation rules.
- API endpoints or data interactions (to be migrated from .NET → Laravel).
- State management approach (Vuex/Pinia mapping).
- Event handling and UI → Logic data flow.

---

### 4. **Integrated UI–Logic Mapping**
- For every UI component or screen, map corresponding logic functions or API integrations.
- Include:
  - Component name
  - Function/service linked
  - Data inputs/outputs
  - Event triggers and expected behaviors
- Show how backend data flows into the UI and user actions trigger backend updates.

Use a table format, e.g.:

| UI Component | Function / Service | API / Endpoint | Data Flow Direction | Expected Behavior |
|---------------|--------------------|----------------|---------------------|-------------------|
| EmployeeForm.vue | saveEmployee() | `/api/employee/save` | UI → Backend | Saves employee details to DB |

---

### 5. **Database & Model Alignment**
- Summarize DB tables and fields referenced by this module.
- Map Laravel models to UI forms and logic functions.
- Note any schema changes or data normalization done during migration.

---

### 6. **Testing & Validation Plan**
- Combine UI test coverage areas (Playwright MCP Server) with logic-level test cases.
- Mention test responsibilities:
  - Frontend UI (visual, UX)
  - Backend API (data integrity, validation)
  - Integration testing (UI ↔ API ↔ DB)
- Suggest automation coverage boundaries.

---

### 7. **Risk, Edge Cases & Dependencies**
- Highlight migration pain points (UI–Logic mismatch, deprecated React hooks, incompatible APIs, etc.)
- Recommend mitigation strategies.
- Identify cross-module dependencies.

---

### 8. **Step-by-Step Implementation Plan**
- Order of execution for migration tasks in this module:
  - Backend first (Laravel endpoints)
  - Logic migration (Vue services + state)
  - UI integration (Vue components)
  - Testing and validation
- Include parallel tasks if possible.

---

## Global Integration Rules

- Analyze both **UI design docs** and **functional docs** module by module.
- Keep **both perspectives tightly synchronized** — no separation between UI and logic.
- Maintain consistency in naming conventions, schema references, and flow diagrams.
- Clearly tag content source (e.g., `From UI Docs:` vs `From Functional Docs:`) where needed.
- If combined content exceeds **1500 tokens**, split into multiple `.md` parts (e.g., `part1`, `part2`, etc.), maintaining continuity.

---

## Expected Deliverables

- Output one unified implementation blueprint per module.
- Each blueprint should be:
  - Markdown formatted
  - Fully integrated (UI + Logic + DB)
  - Developer-ready for execution
  - Organized, consistent, and exhaustive

---

## Action to Perform

> Analyze all documentation from:
> - `docs/module/` (functional & logical)
> - `docs/ui/` (or your design documentation folder)
>
> Then generate **merged implementation blueprints** for each module using the structure above.

---

# End of Prompt
