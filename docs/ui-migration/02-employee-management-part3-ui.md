# Employee Management Part 3 - UI Migration Guide
## Employee Profile & Personal Information Interface

## 1. Module Overview

The Employee Profile module provides comprehensive personal and professional information management for individual employees. This module serves as a centralized hub for viewing and editing employee details, including personal information, employment history, education details, and other relevant employee data through a sophisticated tabbed interface.

### Key UI/UX Scenarios:
- Comprehensive employee profile view with tabbed navigation
- Personal information display and editing capabilities
- Employment details management and history tracking
- Education and certification management
- Document and attachment handling
- Profile image upload and management
- Resignation status integration and workflow initiation
- Permission-based visibility of profile sections

### UI Design Principles:
- Tab-based organization for logical grouping of information
- Responsive design adapting to various screen sizes
- Permission-driven interface elements
- Clear visual hierarchy for different information types
- Seamless integration with other HRMS modules

## 2. UI Component Inventory

### Core React Components:
- **`Profile/index.tsx`** - Main profile container with tab orchestration
- **`TabPanel`** - Dynamic tab management component
- **`EmployeeTabs`** - Configuration component for profile tabs
- **`PersonalDetailsTab`** - Personal information display and editing
- **`EmploymentDetailsTab`** - Employment history and current details
- **`EducationDetailsTab`** - Educational background management

### Profile Management Components:
- **Profile Header**: Employee photo, name, and basic information
- **Tab Navigation**: Dynamic tab switching with permission checking
- **Information Cards**: Structured data display components
- **Edit Forms**: Inline editing for profile information
- **Document Upload**: File attachment and management

### External UI Libraries Used:
- **Material-UI (MUI) v6.5.0**:
  - `Paper` for main container with elevation
  - `Tabs`, `Tab`, `TabPanel` for navigation structure
  - `Avatar`, `Card`, `Typography` for information display
  - `TextField`, `Select`, `DatePicker` for form inputs
- **React Hook Form v7.52.2**:
  - Form state management for profile editing
  - Validation integration with profile data

### Custom UI Utilities:
- **`hasPermission`**: Permission-based UI element rendering
- **`useFeatureFlag`**: Feature toggle-based component visibility
- **`getFullName`**: Name formatting utility
- **Profile Store**: Centralized profile data management

## 3. Component Structure & Hierarchy

```
Profile (Main Container)
├── BreadCrumbs (Navigation)
├── Paper (Material Design Container)
│   └── TabPanel (Tab Management)
│       ├── Tab Navigation Header
│       │   ├── Personal Details Tab
│       │   ├── Employment Details Tab
│       │   ├── Education Details Tab
│       │   ├── Documents Tab
│       │   ├── IT Assets Tab (conditional)
│       │   └── Exit Details Tab (conditional)
│       └── Tab Content Panels
│           ├── PersonalDetailsPanel
│           │   ├── ProfileHeader
│           │   │   ├── Avatar (Photo)
│           │   │   ├── EmployeeName
│           │   │   ├── EmployeeCode
│           │   │   └── Designation
│           │   ├── PersonalInfoCards
│           │   │   ├── BasicInformation
│           │   │   ├── ContactDetails
│           │   │   ├── AddressInformation
│           │   │   └── EmergencyContacts
│           │   └── EditProfileForm (conditional)
│           ├── EmploymentDetailsPanel
│           │   ├── CurrentEmployment
│           │   ├── EmploymentHistory
│           │   ├── ReportingStructure
│           │   └── SalaryInformation
│           ├── EducationDetailsPanel
│           │   ├── AcademicQualifications
│           │   ├── Certifications
│           │   ├── ProfessionalCourses
│           │   └── SkillsMatrix
│           └── ConditionalTabs (based on permissions/features)
│               ├── ITAssetsPanel
│               └── ExitDetailsPanel
```

### Key Props & UI State:

#### Profile Component:
```typescript
interface ProfileState {
  personalDetails: PersonalDetailsType | undefined;
  resignationStatusData: {
    resignationId: number;
    resignationStatus: ResignationStatusCode;
  } | null;
  isLoading: boolean;
  loadingResignationStatus: boolean;
}
```

#### TabPanel Component:
```typescript
interface TabConfig {
  label: string;
  component: React.ComponentType;
  canRead?: string; // Permission requirement
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabPanelProps {
  tabs: TabConfig[];
  defaultTab?: number;
  orientation?: 'horizontal' | 'vertical';
}
```

## 4. Visual & UX Design Details

### Layout Techniques:
- **Material Design Cards**: Information grouping with consistent elevation
- **CSS Grid**: Responsive layout for information cards
- **Tab Navigation**: Horizontal scrolling on mobile, full display on desktop
- **Sticky Headers**: Profile header remains visible during scroll

### Style Properties:

#### Profile Header Styling:
```css
Profile Header:
- Background: Linear gradient or solid color
- Avatar Size: 120px (desktop), 80px (mobile)
- Name Typography: 1.5rem, weight: 600
- Title Typography: 1rem, weight: 400, color: #757575
- Padding: 24px (desktop), 16px (mobile)

Information Cards:
- Background: #ffffff
- Border Radius: 8px
- Box Shadow: 0 2px 4px rgba(0,0,0,0.1)
- Padding: 20px
- Margin: 16px between cards
```

#### Tab Navigation Styling:
```css
Tab Container:
- Background: #f8f9fa
- Border Bottom: 1px solid #e0e0e0
- Min Height: 48px

Tab Items:
- Font: 0.875rem, weight: 500
- Padding: 12px 16px
- Active Color: #1976d2
- Inactive Color: #757575
- Hover Background: rgba(25, 118, 210, 0.04)

Tab Indicator:
- Height: 2px
- Color: #1976d2
- Animation: 250ms cubic-bezier(0.4, 0, 0.2, 1)
```

#### Information Display:
```css
Field Labels:
- Font: 0.75rem, weight: 600, color: #424242
- Text Transform: uppercase
- Letter Spacing: 0.5px

Field Values:
- Font: 0.875rem, weight: 400, color: #212121
- Line Height: 1.5
- Margin Bottom: 8px

Edit Mode Styling:
- Input Background: #fafafa
- Border: 1px solid #e0e0e0
- Focus Border: #1976d2
- Error Border: #d32f2f
```

### Responsive Behavior:

#### Mobile (≤768px):
- **Tab Navigation**: Horizontal scroll with swipe gestures
- **Information Cards**: Single column layout, full width
- **Profile Header**: Compact vertical layout
- **Edit Forms**: Stack form fields vertically

#### Tablet (768-1024px):
- **Tab Navigation**: Full display if tabs fit, otherwise scroll
- **Information Cards**: Two-column layout for optimal space usage
- **Profile Header**: Horizontal layout with avatar and info side-by-side

#### Desktop (≥1024px):
- **Tab Navigation**: Full horizontal display
- **Information Cards**: Three-column layout for dense information display
- **Profile Header**: Enhanced layout with additional quick actions

### UI Feedback & Status Indicators:

#### Loading States:
```typescript
// Profile loading skeleton
<ProfileSkeleton>
  <SkeletonAvatar />
  <SkeletonText lines={2} />
  <SkeletonCards count={3} />
</ProfileSkeleton>

// Tab loading indicator
<TabLoadingIndicator />
```

#### Edit Mode Indicators:
- **Edit Toggle**: Pencil icon indicating editable sections
- **Unsaved Changes**: Orange indicator for modified fields
- **Validation Errors**: Red highlighting with error messages
- **Save Success**: Green checkmark with success message

#### Permission-Based Visibility:
- **Restricted Content**: Greyed out or hidden based on permissions
- **Read-Only Fields**: Clear visual indication of non-editable content
- **Action Availability**: Context-sensitive action button states

### Animations & Transitions:

#### Tab Switching:
```css
Tab Content Transition: opacity 200ms ease-in-out;
Tab Indicator Movement: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
```

#### Edit Mode Transitions:
- **Form Field Focus**: Border color transition (150ms)
- **Card Hover**: Elevation change (200ms)
- **Save Animation**: Success checkmark with scale animation

## 5. Interaction Patterns & Accessibility

### UI Event Handling:

#### Tab Navigation:
```typescript
const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
  setActiveTab(newValue);
  // Update URL parameter for deep linking
  setSearchParams({ tab: tabs[newValue].id });
};
```

#### Profile Editing:
```typescript
const handleEditToggle = (section: string) => {
  setEditingSections(prev => ({
    ...prev,
    [section]: !prev[section]
  }));
};

const handleSaveProfile = async (formData: ProfileFormData) => {
  try {
    await updateProfile(formData);
    setEditingSections({});
    showSuccessMessage('Profile updated successfully');
  } catch (error) {
    showErrorMessage('Failed to update profile');
  }
};
```

### Focus Management:

#### Tab Navigation:
- **Keyboard Navigation**: Arrow keys navigate between tabs
- **Tab Content Focus**: Focus moves to content when tab is selected
- **Edit Mode Focus**: First editable field receives focus when entering edit mode

#### Form Interactions:
- **Field Validation**: Real-time validation with immediate feedback
- **Error Focus**: First invalid field receives focus on submission error
- **Save/Cancel**: Clear focus handling for form actions

### ARIA Attributes:

#### Tab Accessibility:
```html
<div role="tablist" aria-label="Employee Profile Sections">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="personal-details-panel"
    id="personal-details-tab"
  >
    Personal Details
  </button>
</div>

<div
  role="tabpanel"
  aria-labelledby="personal-details-tab"
  id="personal-details-panel"
>
  <!-- Tab content -->
</div>
```

#### Profile Information:
```html
<section aria-label="Employee Information">
  <h2 id="profile-heading">John Doe - Software Engineer</h2>
  <dl aria-labelledby="profile-heading">
    <dt>Employee ID</dt>
    <dd>EMP001</dd>
    <dt>Department</dt>
    <dd>Engineering</dd>
  </dl>
</section>
```

### Keyboard Shortcuts:
- **Tab Navigation**: Left/Right arrow keys
- **Edit Mode**: Ctrl/Cmd + E to toggle edit mode
- **Save**: Ctrl/Cmd + S to save changes
- **Cancel**: Escape key to cancel editing

## 6. Migration Considerations (Vue.js UI Focus)

### React to Vue.js Patterns:

#### Tab State Management:
```typescript
// React Pattern
const [activeTab, setActiveTab] = useState(0);
const [personalDetails, setPersonalDetails] = useState<PersonalDetailsType>();

// Vue 3 Composition API Equivalent
const activeTab = ref(0);
const personalDetails = ref<PersonalDetailsType>();

const handleTabChange = (tabIndex: number) => {
  activeTab.value = tabIndex;
};
```

#### Profile Data Management:
```vue
<!-- Vue Profile Component -->
<template>
  <div class="profile-container">
    <BreadCrumbs />
    
    <v-card elevation="3">
      <v-tabs v-model="activeTab" @update:model-value="handleTabChange">
        <v-tab
          v-for="tab in visibleTabs"
          :key="tab.id"
          :disabled="tab.disabled"
        >
          <v-icon start>{{ tab.icon }}</v-icon>
          {{ tab.label }}
        </v-tab>
      </v-tabs>
      
      <v-tabs-window v-model="activeTab">
        <v-tabs-window-item
          v-for="(tab, index) in visibleTabs"
          :key="tab.id"
          :value="index"
        >
          <component
            :is="tab.component"
            :profile-data="profileData"
            :can-edit="canEditProfile"
            @update="handleProfileUpdate"
          />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProfileStore } from '@/stores/profile';
import { usePermissions } from '@/composables/usePermissions';

const activeTab = ref(0);
const profileStore = useProfileStore();
const { hasPermission } = usePermissions();

const profileData = computed(() => profileStore.currentProfile);
const canEditProfile = computed(() => hasPermission('PROFILE.EDIT'));

const visibleTabs = computed(() =>
  allTabs.filter(tab => 
    !tab.permission || hasPermission(tab.permission)
  )
);

const handleTabChange = (tabIndex: number) => {
  activeTab.value = tabIndex;
};

onMounted(() => {
  profileStore.fetchProfile();
});
</script>
```

### External Library Adaptations:

#### Tab System Migration:
- **MUI Tabs** → **Vuetify VTabs**
- **TabPanel** → **VTabsWindow + VTabsWindowItem**
- **Custom Tab Component** → **Vue 3 dynamic components**

#### Form Handling Migration:
```vue
<!-- Personal Details Form -->
<template>
  <v-form ref="personalForm" @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.firstName"
          label="First Name"
          :readonly="!editMode"
          :error-messages="errors.firstName"
          required
        />
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.lastName"
          label="Last Name"
          :readonly="!editMode"
          :error-messages="errors.lastName"
          required
        />
      </v-col>
    </v-row>
    
    <v-row v-if="editMode" class="form-actions">
      <v-spacer />
      <v-btn variant="text" @click="cancelEdit">Cancel</v-btn>
      <v-btn
        type="submit"
        color="primary"
        :loading="saving"
      >
        Save Changes
      </v-btn>
    </v-row>
  </v-form>
</template>
```

### Styling Consistency Strategy:

#### Profile Header Component:
```vue
<template>
  <v-card class="profile-header" flat>
    <v-card-text class="profile-content">
      <div class="profile-avatar-section">
        <v-avatar size="120" class="profile-avatar">
          <v-img
            v-if="profileData.photoUrl"
            :src="profileData.photoUrl"
            :alt="`${profileData.fullName} Profile Photo`"
          />
          <span v-else class="avatar-initials">
            {{ getInitials(profileData.fullName) }}
          </span>
        </v-avatar>
        
        <v-btn
          v-if="canEditProfile"
          icon="mdi-camera"
          size="small"
          class="avatar-edit-btn"
          @click="openPhotoDialog"
        />
      </div>
      
      <div class="profile-info-section">
        <h1 class="profile-name">{{ profileData.fullName }}</h1>
        <p class="profile-title">{{ profileData.designation }}</p>
        <p class="profile-id">{{ profileData.employeeCode }}</p>
        
        <div class="profile-badges">
          <v-chip
            v-if="profileData.status"
            :color="getStatusColor(profileData.status)"
            variant="elevated"
          >
            {{ profileData.status }}
          </v-chip>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.profile-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  margin-bottom: 24px;
}

.profile-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-avatar-section {
  position: relative;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: white !important;
}

.profile-info-section {
  flex: 1;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.profile-title {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 4px;
}

.profile-id {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-avatar-section {
    margin-bottom: 16px;
  }
}
</style>
```

### Potential UI Glitch Risks:

1. **Tab State Synchronization**: URL parameter syncing with active tab
2. **Profile Image Upload**: File handling and preview functionality
3. **Form Validation Timing**: Real-time vs. on-submit validation differences
4. **Permission-Based Rendering**: Dynamic tab visibility calculations
5. **Mobile Tab Scrolling**: Touch gesture handling differences

### Migration Implementation Strategy:

#### Phase 1: Basic Profile Structure
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';

// Tab configuration
const tabs = [
  { id: 'personal', label: 'Personal Details', component: 'PersonalDetailsTab' },
  { id: 'employment', label: 'Employment', component: 'EmploymentDetailsTab' },
  { id: 'education', label: 'Education', component: 'EducationDetailsTab' }
];

// State management
const activeTab = ref(0);
const profileStore = useProfileStore();
const route = useRoute();
const router = useRouter();

// Initialize tab from URL parameter
onMounted(() => {
  const tabParam = route.query.tab as string;
  if (tabParam) {
    const tabIndex = tabs.findIndex(tab => tab.id === tabParam);
    if (tabIndex !== -1) {
      activeTab.value = tabIndex;
    }
  }
  
  profileStore.fetchProfile(route.params.employeeId as string);
});

// Handle tab changes with URL updates
const handleTabChange = (tabIndex: number) => {
  activeTab.value = tabIndex;
  router.replace({
    query: { ...route.query, tab: tabs[tabIndex].id }
  });
};
</script>
```

## 7. Visual Reference & Debugging Notes

### Key UI States to Validate:

1. **Profile Loading State**:
   - Skeleton loading for avatar, name, and information cards
   - Tab navigation disabled during loading
   - Proper loading indicators for each section

2. **Edit Mode States**:
   - Clear visual distinction between read and edit modes
   - Proper form validation and error display
   - Unsaved changes indication and confirmation dialogs

3. **Permission-Based Visibility**:
   - Correct hiding/showing of tabs based on permissions
   - Read-only vs. editable field states
   - Action button availability based on user roles

4. **Responsive Behavior**:
   - Tab scrolling on mobile devices
   - Information card layout adaptation
   - Profile header responsive design

### Known UI/UX Pain Points:

1. **Tab Overflow**: Too many tabs causing horizontal scroll issues
2. **Large Form Sections**: Overwhelming information density
3. **Profile Photo Upload**: Complex file handling and validation
4. **Permission Complexity**: Confusing partial access scenarios
5. **Mobile Navigation**: Difficult tab navigation on small screens

### Debugging Checklist:

#### Profile Functionality:
- [ ] Profile data loads correctly from API
- [ ] Tab navigation works with keyboard and mouse
- [ ] Edit mode toggles properly for each section
- [ ] Form validation provides clear feedback
- [ ] Profile updates save correctly and refresh data

#### Responsive Design:
- [ ] Tab navigation scrolls properly on mobile
- [ ] Information cards stack appropriately on small screens
- [ ] Profile header adapts to screen size
- [ ] Touch interactions work smoothly on mobile devices
- [ ] Text remains readable across all screen sizes

#### Accessibility:
- [ ] Tab navigation works with keyboard only
- [ ] Screen readers announce tab changes correctly
- [ ] Form fields have proper labels and descriptions
- [ ] Focus management works throughout the interface
- [ ] Color contrast meets accessibility standards

#### Performance:
- [ ] Profile data loads efficiently without blocking UI
- [ ] Tab switching is smooth without delays
- [ ] Form interactions are responsive
- [ ] Profile photo upload handles large files appropriately
- [ ] Memory usage remains stable during navigation

This comprehensive documentation provides the foundation for migrating the Employee Profile interface while maintaining all functionality and improving the user experience with Vue.js patterns and Vuetify components.