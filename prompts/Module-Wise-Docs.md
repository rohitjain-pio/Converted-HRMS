ROLE:
You are a highly skilled software system analyst and technical documentation expert.
You will analyze the provided project codebase and generate accurate, structured, and modular documentation that mirrors the project’s real features and architecture — without any assumptions or extra content.



🎯 OBJECTIVE



Create a complete, SDLC-aligned documentation package for the given legacy application.
The documentation will serve as the foundation for rebuilding the same project in a new technology stack, module by module, following a logical and functional sequence.
Your focus: descriptive accuracy, not code representation.



⚙️ STRICT RULES & CONSTRAINTS



No Assumptions / No Hallucinations / No Bonus Content



Only include facts verifiable directly from the codebase.



Do not guess or infer missing logic.



If information is not found, mark it as: [Information Missing in Codebase].



No Code Output



Do not include any code blocks, snippets, pseudocode, SQL queries, or configuration lines.



Only describe what the code does, not how it is written.



All explanations must be in natural language, lists, or structured tables.



No Creative Additions



Do not suggest improvements or enhancements.



No comparisons to other systems or best practices.



Do not invent missing requirements or implied features.



Precision & Traceability



Every detail must map directly to observed code structure or behavior.



Use consistent, technical phrasing. Avoid opinions or assumptions.



🧩 DOCUMENTATION PHASES
PHASE 1: Project Overview



Project name and purpose



Objectives and target users



Tech stack and dependencies



System architecture overview



Folder and file structure (descriptive only)



Execution flow overview



PHASE 2: SDLC MODELS & DELIVERABLES



Create all documentation artifacts based strictly on the codebase:



Business Requirement Document (BRD) – what business goals or problems the system solves



Functional Requirement Document (FRD) – detailed list of actual implemented features and flows



Software Requirement Specification (SRS) – all requirements derived from existing code



High-Level Design (HLD) – component structure and inter-module communication



Low-Level Design (LLD) – detailed behavior and relationships (no code)



PHASE 3: MODULE-WISE DOCUMENTATION (SEQUENTIAL)



Purpose of this phase:
Break down the project into functional modules and document them one by one in logical development order, as if rebuilding the system step-by-step.
Each module should represent a self-contained system feature or functional area.



The AI should:



Identify modules based on actual code folder structure, class groupings, or functional naming.



Arrange modules in logical sequence (example below).



Fully complete documentation for one module at a time, following the SDLC structure, before moving to the next.



Suggested Module Order Example (adaptable to real project):



Authentication & Authorization



User Setup & Role Management



Employee / HR Information Management



HR Policies & Leave Configuration



Attendance & Time Tracking



Payroll Management



Reporting & Analytics



Notifications & Communication



Settings / Configuration Management



Admin Dashboard & Access Control



⚠️ Only include modules that exist in the codebase — skip missing ones and mark them as [Not Found in Codebase].



For each module, document the following (as a standalone section):



Module Name
Purpose / Role in System
Implemented Features
Data Models / Entities Used
External Dependencies or Services
APIs or Endpoints (describe, not code)
UI Components / Screens (if any)
Workflow or Process Description (in words)
Error Handling / Edge Cases
Integration Points with Other Modules
Dependencies / Reused Components
Testing Artifacts (if found)



PHASE 4: DATABASE & DATA MODELS



Type of database(s)



Entities, tables, and relationships (described textually)



Constraints, triggers, and validations (in natural language)



Data flow between modules



PHASE 5: SYSTEM FLOW & DEPLOYMENT



Full request-response lifecycle



Internal module interaction flow



API communication map



Config/environment overview (names and purposes only)



Deployment logic (derived from build scripts, CI/CD configs)



PHASE 6: SECURITY, VALIDATION & PERFORMANCE



Document only what exists in code:



Authentication / Authorization methods



Input validation and sanitization



Encryption or hashing



Logging, monitoring, and error handling



Any optimization or caching observed



PHASE 7: TESTING



Testing framework used



Test structure and coverage overview



Type of tests (unit, integration, functional)



No code samples — only summarize observed behavior



PHASE 8: LIMITATIONS & GAPS



Mention unimplemented, incomplete, or commented-out features



Mark as [Not Found in Codebase] where functionality is referenced but absent



🧱 OUTPUT FORMAT REQUIREMENTS



Use clear Markdown section headers (##, ###, etc.)



Use bullet points, lists, and tables where possible



Maintain a neutral, descriptive tone



No code blocks or fenced code sections (```) anywhere



Flow logically from overview → SDLC → modules → database → flow → testing → gaps



🧩 SAMPLE FORMAT (for one module)
## Module: Authentication & Authorization



**Purpose:**  
Handles user registration, login, token-based access, and permission validation.



**Implemented Features:**  
- Email/password registration  
- JWT-based authentication  
- Middleware for role-based access  
- Token expiration and refresh handling  



**Data Models / Entities:**  
- User: id, email, passwordHash, role, timestamps  
- Session: token, userId, expiry  



**APIs / Endpoints (described):**  
- Register User  
- Login User  
- Validate Token  



**Workflow Description:**  
User registers → credentials stored securely → token issued → token used to access protected routes.  



**Error Handling:**  
Invalid credentials, expired tokens, and duplicate email checks handled via standardized middleware.  



**Integration Points:**  
- User Setup Module (to assign default role on creation)



✅ FINAL OUTPUT GOAL



Produce a complete, sequential, code-free documentation that:



Reflects the actual existing functionality



Follows a module-by-module, phase-wise SDLC flow



Is ready to guide redevelopment in a new tech stack without gaps or assumptions





🧭 1. Documentation Format: Single comprehensive document or separate files per phase/module?



✅ Recommended: Separate files per phase/module



Reasoning:



Keeping each phase or module in a separate document (or markdown file) makes it much easier to manage, review, and feed into other tools (like code generators or design AI).



Large comprehensive documents quickly become heavy, hard to navigate, and token-expensive for AI tools.



Separate files give you modularity — e.g., you can rebuild only the Authentication module or only the Payroll module in a new tech stack without rereading the whole project doc.



Structure Suggestion:



/documentation
   /phase-1-project-overview.md
   /phase-2-sdlc-docs.md
   /modules
      /authentication.md
      /user-setup.md
      /hr-policies.md
      /attendance.md
      /payroll.md
   /database.md
   /system-flow.md
   /security.md
   /testing.md
   /limitations.md





💡 You can then later merge all of them into a master “Comprehensive System Documentation” file if needed for stakeholders.



⚙️ 2. Detail Level: Include all 160+ permissions and API endpoints, or summarize by category?



✅ Recommended: Summarize by category, but include a structured reference list appendix.



Reasoning:



Listing all 160+ permissions and endpoints in the main flow would make the documentation unreadable and waste AI context later.



The right balance is:



In the main document: Group endpoints and permissions by feature category or module (e.g., “User Management APIs”, “Payroll APIs”).



In an appendix or separate reference file: Include a table of all endpoints with brief one-line purpose descriptions.



Suggested Structure:



In each module’s section:



**APIs:**
- Authentication APIs (3 total): Register, Login, Validate Token
- User Setup APIs (5 total): Create User, Assign Role, Update Role, List Roles, Remove User
- [Full list in Appendix A]





Then in appendix-api-reference.md:



Endpoint  Method  Purpose  Module  Auth Required
/api/auth/register  POST  Registers a new user  Authentication  No
/api/users/:id/role  PUT  Updates user role  User Setup  Yes



Same for permissions — group by feature area in the main document and list all in a Permissions Matrix Appendix.



🧩 3. Database Scripts: Document each sprint's changes separately or as a consolidated schema view?



✅ Recommended: Consolidated schema view, with change history as optional appendix.



Reasoning:



The modernization goal is to understand the final working system, not the incremental sprint history.



Consolidated schema (final model view) is ideal for AI code generation or database migration tools.



However, if your organization needs traceability (for audit or compliance), you can add an Appendix B: Database Evolution summarizing changes per sprint.



Suggested Approach:



In database.md:



Present the final unified schema (entities, relationships, constraints).



Provide an ER diagram description in text form.



If available, summarize “Change History” at the end.



Example:



### Final Schema Overview
- Tables: users, roles, employees, attendance, payroll
- Relationships: 
  - users → roles (many-to-one)
  - employees → payroll (one-to-many)
  - employees → attendance (one-to-many)



### Schema Change History (Optional)
- Sprint 4: Added `department_id` to employees table
- Sprint 7: Introduced `payroll_adjustments` table