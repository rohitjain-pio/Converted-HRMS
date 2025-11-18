# 🏗️ HRMS Migration — Master Backend Generation Prompt for GitHub Copilot

You are assisting in a structured, controlled, and highly constrained migration of a **Legacy HRMS System** to a **modern backend** using the *existing MySQL database*.

Your behavior must be:
- **Strictly deterministic**
- **Fully reference-based**
- **No assumptions allowed**
- **Step-by-step and sequential**
- **Transparent with decisions and reasoning**

Your job is to analyze, document, reconstruct, and generate backend code using the existing DB, frontend routes, and all project documentation — exactly as they exist.

This prompt defines your instructions. **Follow it literally.**

---

# 📚 **Available Reference Sources**

You are allowed to use the following repositories and documentation sources:

### 🔹 Legacy Code & DB
- `@Legacy/Backend` — Legacy .NET API backend code  
- `@Legacy/Frontend` — Legacy React frontend  
- `@Legacy/Database` — Original DB SQL scripts  

### 🔹 Documentation
- `@Docs/Database documentation` — DB tables, SPs, relationships, constraints, diagrams  
- `@Docs/modules` — Functional descriptions for all modules  
- `@Docs/planning/module-1` & `@Docs/planning/module-2` — Implementation details & workflows  
- `@Docs/planning/tech-stack-mapping` — Mapping between old stack → new stack  
- `@Docs/setup-guide` — Information about all MCP plugins/tools being used  

### 🔹 Migrated Frontend
- `@Hrms-Frontend` — Fully migrated modern frontend  
  Must be routed, connected, and bound to the backend **with zero mismatch**.

---

# 🧠 **Primary Objective**

Create a **new backend** that:

1. Uses the **existing MySQL database (`hrms_db` on WAMP)** *exactly as is*.  
2. Implements backend logic strictly according to:
   - Legacy .NET code  
   - Legacy React frontend behavior  
   - Database documentation  
   - Module plans  
3. Remains 100% compatible with the **new migrated frontend** (`@Hrms-Frontend`).  
4. Uses **precise and validated routing** — no mismatches allowed.  
5. Includes **dummy seed data** for:
   - Users  
   - Module-1 related tables  
   - Module-2 related tables  
6. Adds **no new features**, **no enhancements**, **no refactors**, **no redesigns**.  
7. Follows a strict **analyze → document → generate → test** pipeline.

---

# 🧩 **Backend Requirements (Detailed)**

### ✔ EXACT DB Mapping  
- Use the MySQL MCP to introspect the database `hrms_db`.  
- Validate that **every table, column, datatype, relationship, and stored procedure** matches the documentation.  
- DO NOT modify, rename, infer, or extend the schema.  
- Backend models must match DB schema *exactly*.

### ✔ Routing Alignment with Frontend  
- Analyze `@Hrms-Frontend` and `@Legacy/Frontend` routes.  
- Ensure all frontend API calls match backend endpoints 1:1.  
- If a mismatch is found, DO NOT guess; instead:
  - List the mismatch
  - Request clarification

### ✔ Logic Alignment with Legacy Backend  
- Refer to `@Legacy/Backend` for:
  - Business rules  
  - Validation  
  - API response shapes  
  - Auth logic  
  - Role-based behaviors  
- Replicate everything faithfully — **no modernization unless mapping docs explicitly allow it**.

### ✔ Dummy Data Requirements  
Seed:
- At least **5 test users** (roles included, if applicable)  
- Complete example data for all tables required by Module-1  
- Complete example data for all tables required by Module-2  
- Data must be consistent with relationships and constraints  

---

# 🚫 **Migration Constraints — Follow Exactly**

These rules supersede all other behaviors:

1. **No Hallucination**  
   Do not invent:  
   - Fields  
   - APIs  
   - Logic  
   - Relationships  
   - Modules  
   - Tables  
   - Error states  

2. **No Enhancements**  
   Do not refactor, optimize, simplify, beautify, re-architect, or modernize anything unless the tech-stack mapping explicitly instructs it.

3. **Preserve Frontend Behavior**  
   The migrated frontend’s UI/UX, interactions, and flows must remain **pixel-perfect and behaviorally identical** to the legacy frontend.

4. **Exact Schema Mapping**  
   DB schema must remain exactly as provided.  
   Your backend must conform to it strictly.

5. **Sequential Thinking**  
   Never jump steps.  
   Follow order:  
   1) Analyze  
   2) Document  
   3) Plan  
   4) Generate  
   5) Test  
   6) Version

6. **Explain every assumption**  
   If any ambiguity arises, stop and request clarification.

7. **Version Control Discipline**  
   Every update to a doc must include:  
   - Version number  
   - Timestamp  
   - Changelog

8. **Respect File Structure**  
   Create files and folders only where instructed.

9. **No external dependencies**  
   Only use libraries/tools explicitly listed in the tech-stack mapping documents.

---

# 📄 **Required First Deliverable: BACKEND_TASK_PLAN.md**

Immediately after analyzing all references and scanning `hrms_db` using MySQL MCP:

Create a root-level file named:

```
BACKEND_TASK_PLAN.md
```

This file must include:

### 1. **Overview**
- Purpose of backend migration  
- Summary of modules to be implemented now (Module-1, Module-2)  

### 2. **Sequential Execution Plan**
Clearly listed phases such as:
- Phase 1 — DB Analysis  
- Phase 2 — Route Mapping  
- Phase 3 — Legacy Behavior Extraction  
- Phase 4 — API Structure Design  
- Phase 5 — Controller/Service Implementation  
- Phase 6 — Seeder & Dummy Data  
- Phase 7 — Integration with Frontend  
- Phase 8 — Testing & QA  

### 3. **DB Mapping Summary**
- List of all tables relevant to modules  
- SPs used by modules  
- Relationship dependencies  

### 4. **Routing Integration Plan**
- Table mapping frontend routes → backend endpoints  
- Any mismatches found  
- Questions for clarification (if applicable)

### 5. **Tech Stack Compliance Plan**
- Mapping old tech → new tech (per mapping docs)

### 6. **Test Data Plan**
- Which tables will be seeded  
- What dummy values will be inserted  

### 7. **Version Information**
- Start at Version `1.0.0`  
- Add a changelog section

This `.md` file is the **ground truth**.  
For all future backend outputs, **you must follow only this plan**.

---

# 🟩 **Start Now**

Begin with:

1. Read all references listed above  
2. Analyze the existing MySQL database (`hrms_db`) using MCP  
3. Generate `BACKEND_TASK_PLAN.md` (versioned, detailed, structured)  
4. Wait for user confirmation before generating code  

Do NOT write backend code until I approve the plan.
If you have any doubts let me know I will help you to resolve just do not do anything by yourself and not assuem anything