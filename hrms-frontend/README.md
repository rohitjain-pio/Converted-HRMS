# HRMS Frontend

Vue.js 3 + TypeScript + Vuetify 3 frontend for the HRMS application.

## Tech Stack

- **Vue.js 3** - Progressive JavaScript Framework (Composition API)
- **TypeScript** - Type-safe JavaScript
- **Vuetify 3** - Material Design component framework
- **Pinia** - State management
- **Vue Router** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **Azure MSAL** - Microsoft Authentication Library

## Prerequisites

- Node.js 18+ and npm 9+
- Backend API running on `http://localhost:8000`

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

## Development

```bash
# Start development server
npm run dev

# Access at http://localhost:5173
```

## Build

```bash
# Type check and build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── assets/              # Static assets
├── components/          # Reusable components
│   ├── common/         # Common components
│   └── layout/         # Layout components
├── composables/        # Vue composables (hooks)
├── router/             # Vue Router configuration
├── services/           # API services
├── stores/             # Pinia stores
├── types/              # TypeScript types
├── views/              # Page components
├── App.vue             # Root component
└── main.ts             # Application entry point
```

## Features

- ✅ Authentication (Standard Login + Azure AD SSO)
- ✅ Token-based authorization with auto-refresh
- ✅ Permission-based access control
- ✅ Responsive Material Design UI
- ✅ Route guards
- ✅ Type-safe API calls

## Environment Variables

Create a `.env` file with:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_AZURE_CLIENT_ID=your_azure_client_id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your_tenant_id
VITE_AZURE_REDIRECT_URI=http://localhost:5173
```

## UI Design System

🎨 **All UI components MUST follow the established design system documentation.**

### Design System Documentation

📚 **Location:** `../docs/ui-design/`

#### Complete Design System Guide

1. **[Part 1: Colors & Typography](../docs/ui-design/LEGACY-DESIGN-SYSTEM-PART-1-OVERVIEW-COLORS.md)**
   - **Color Palette:**
     - Primary: `#1e75bb` (Blue)
     - Dark: `#283a50` (Navy)
     - Background: `#eef4fb` (Light Blue)
     - Success: `#52c41a`, Warning: `#faad14`, Error: `#ff4d4f`
     - Grey Scale: 10 shades from `#ffffff` to `#000000`
   - **Typography:**
     - Font Family: `'Roboto', sans-serif`
     - Headings: 600 weight
     - Body: 400 weight
     - Sizes: 12px, 14px, 16px, 20px, 24px

2. **[Part 2: Spacing & Layout](../docs/ui-design/LEGACY-DESIGN-SYSTEM-PART-2-SPACING-LAYOUT.md)**
   - **Spacing System:**
     - Base unit: 8px
     - Scale: 0, 8, 16, 24, 32, 40, 48px
   - **Grid System:** 12-column grid
   - **Z-index Layers:** Modal (1300), Drawer (1200), AppBar (1100)

3. **[Part 3: Responsive Design](../docs/ui-design/LEGACY-DESIGN-SYSTEM-PART-3-RESPONSIVE.md)**
   - **Breakpoints:**
     - xs: 0px (mobile)
     - sm: 600px (tablet)
     - md: 900px (desktop)
     - lg: 1200px (large desktop)
     - xl: 1536px (extra large)
   - **Mobile-first approach**
   - **Responsive patterns for cards, tables, forms**

4. **[Part 4: Components](../docs/ui-design/LEGACY-DESIGN-SYSTEM-PART-4-COMPONENTS.md)**
   - **Buttons:** Outlined variant, hover effects
   - **Inputs:** Outlined `v-text-field`, validation states
   - **Cards:** White background, subtle shadows
   - **Tables:** Striped rows, hover states
   - **Dialogs:** Centered, max-width 600px
   - **Chips:** Small size, rounded

5. **[Part 5: Layout & Global](../docs/ui-design/LEGACY-DESIGN-SYSTEM-PART-5-LAYOUT-GLOBAL.md)**
   - **Navigation:** Drawer width 260px
   - **Page Layout:** Main content with padding
   - **Global Styles:** CSS reset, scrollbar styling

#### UI Implementation References

- **[Internal Login UI](../docs/ui-design/INTERNAL-LOGIN-UI-REPLICATION.md)**
  - Split-panel layout (illustration | form)
  - Form validation patterns
  - Responsive behavior
  - Example of complete page implementation

- **[UI Replication Summary](../docs/ui-design/UI-REPLICATION-SUMMARY.md)**
- **[UI Visual Comparison](../docs/ui-design/UI-VISUAL-COMPARISON.md)**
- **[UI Files Modified](../docs/ui-design/UI-FILES-MODIFIED.md)**

### Quick Reference for Common Components

#### Button
```vue
<v-btn
  variant="outlined"
  color="primary"
  :loading="loading"
>
  Sign In
</v-btn>
```

#### Text Field
```vue
<v-text-field
  v-model="email"
  label="Email"
  variant="outlined"
  type="email"
  :rules="[rules.required, rules.email]"
/>
```

#### Card
```vue
<v-card elevation="2">
  <v-card-title>Title</v-card-title>
  <v-card-text>Content</v-card-text>
  <v-card-actions>
    <v-btn>Action</v-btn>
  </v-card-actions>
</v-card>
```

#### Color Usage
```vue
<template>
  <div :style="{ backgroundColor: '#eef4fb' }">
    <h1 :style="{ color: '#1e75bb' }">Heading</h1>
  </div>
</template>
```

### Design System Checklist for New Components

✅ **Before creating any UI component:**

1. **Check the design system docs** for existing patterns
2. **Use Vuetify 3 components** (not custom HTML)
3. **Apply correct colors** from the palette
4. **Use Roboto font** family
5. **Follow spacing system** (8px base unit)
6. **Make it responsive** using breakpoints
7. **Add hover/focus states** for interactive elements
8. **Include validation** for forms
9. **Test on mobile** (xs breakpoint)
10. **Match the visual examples** in the docs

### Automatic UI Generation

When using AI-assisted tools or code generation:

1. **Always reference** the design system documentation
2. **Provide the design docs** as context to AI tools
3. **Validate output** against the visual comparisons
4. **Ensure consistency** with existing components

---

## Contributing

Follow the existing code style and structure. All new features should include TypeScript types.

**UI Contributions:** ALL UI changes must comply with the design system documented in `../docs/ui-design/`.
