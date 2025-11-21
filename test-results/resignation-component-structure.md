# Legacy HRMS - Resignation/Exit Component Structure Analysis

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    App Root                             │
│  ├── Router                                             │
│  │   ├── Login Page                                     │
│  │   └── DashboardLayout (Protected)                    │
│  │       ├── Header                                     │
│  │       │   └── HeaderContent                          │
│  │       │       └── Profile                            │
│  │       │           └── ProfileTab ◄── EXIT ENTRY     │
│  │       │                                              │
│  │       ├── Sidebar                                    │
│  │       └── Main Content                               │
│  │           ├── Routes                                 │
│  │           │   ├── /resignation-form/:userId?         │
│  │           │   │   └── ResignationFormPage            │
│  │           │   │                                      │
│  │           │   ├── /profile/*                         │
│  │           │   │   └── ProfilePage                    │
│  │           │   │       └── EmployeeTabs               │
│  │           │   │           ├── PersonalDetails        │
│  │           │   │           ├── OfficialDetails        │
│  │           │   │           ├── EmploymentDetails      │
│  │           │   │           ├── EducationDetails       │
│  │           │   │           ├── NomineeDetails         │
│  │           │   │           ├── CertificateDetails     │
│  │           │   │           └── ExitDetails ◄── TAB   │
│  │           │   │                                      │
│  │           │   └── /employees/employee-exit           │
│  │           │       ├── ExitEmployeeListPage           │
│  │           │       └── ExitDetailsPage/:resignationId │
│  │           │                                          │
│  └── Global Components                                  │
│      ├── ConfirmationDialog                             │
│      ├── GlobalLoader                                   │
│      └── BreadCrumbs                                    │
└─────────────────────────────────────────────────────────┘
```

## Core Components Detail

### 1. ProfileTab Component
**Location:** `src/layout/Dashboard/Header/HeaderContent/Profile/ProfileTab.tsx`

**Purpose:** Dropdown menu from avatar showing Exit Portal option

**Key Features:**
- Renders profile dropdown menu
- Contains "Exit Portal" button
- Manages resignation status check
- Shows confirmation dialog

**State Management:**
```typescript
const [openResignationDialog, setOpenResignationDialog] = useState(false);
```

**API Calls:**
- `getResignationActiveStatus(userId)` - On Exit Portal click

**Logic Flow:**
```typescript
handleExitPortalClick() {
  fetchResignationActiveStatus();
  
  onSuccess(data) {
    const canInitiate = data === null || 
                       data.status === 'cancelled' || 
                       data.status === 'revoked';
    
    if (canInitiate) {
      setOpenResignationDialog(true); // Show dialog
    } else {
      navigate("/profile/exit-details"); // Direct to details
      handleClose();
    }
  }
}
```

**Rendered UI:**
```tsx
<List>
  <ListItemButton onClick={handleProfileClick}>
    <PersonIcon />
    <ListItemText primary="Profile" />
  </ListItemButton>

  {enableExitEmployee && (
    <ListItemButton onClick={fetchResignationActiveStatus}>
      <ExitToAppIcon />
      <ListItemText primary="Exit Portal" />
    </ListItemButton>
  )}

  <ListItemButton onClick={logoutUser}>
    <LogoutIcon />
    <ListItemText primary="Logout" />
  </ListItemButton>
</List>

<ConfirmationDialog
  title="Are you sure you want to resign?"
  content="Submitting your resignation will start the exit process..."
  open={openResignationDialog}
  onConfirm={() => navigate("/resignation-form")}
/>
```

---

### 2. ResignationForm Component
**Location:** `src/pages/Resignation/ResignationForm.tsx`

**Purpose:** Form to submit resignation with reason

**Props:** None (uses URL params)

**URL Params:**
- `userId` (optional) - For admin submitting on behalf of employee

**Key Features:**
- Pre-fills employee data (read-only fields)
- Validates resignation eligibility on load
- Calculates last working day
- Shows success dialog with dates

**State Management:**
```typescript
const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
const [resignationDetails, setResignationDetails] = useState<ResignationDetails | null>(null);
const [resignationDate, setResignationDate] = useState<moment.Moment | null>(null);
const [lastWorkingDay, setLastWorkingDay] = useState<moment.Moment | null>(null);
```

**API Calls:**
1. `getResignationActiveStatus(userId)` - Verify eligibility
2. `getResignationForm(userId)` - Load employee data
3. `addResignation(payload)` - Submit resignation

**Form Schema:**
```typescript
validationSchema = Yup.object().shape({
  employeeName: Yup.string().required(),
  department: Yup.string().required(),
  reportingManager: Yup.string().required(),
  resignationReason: Yup.string()
    .required("Resignation reason is required")
    .max(500, "Max 500 characters")
});
```

**Submission Logic:**
```typescript
onSubmit(values) {
  add({
    employeeId: resignationDetails.id,
    departmentId: resignationDetails.departmentId,
    reportingManagerId: resignationDetails.reportingManagerId,
    jobType: resignationDetails.jobType,
    reason: values.resignationReason
  });
  
  onSuccess() {
    // Calculate dates
    const today = moment();
    setResignationDate(today);
    setLastWorkingDay(calculateLastWorkingDay(today, jobType));
    
    // Show success dialog
    setOpenConfirmationDialog(true);
  }
}
```

**Success Dialog:**
```tsx
<Dialog open={openConfirmationDialog}>
  <DialogContent>
    <Typography>
      Your resignation Dated {resignationDate} has been submitted successfully,
      as per company exit policy your last working day will be {lastWorkingDay},
      subject to acceptance of your resignation by HR / Reporting Manager.
      
      Please note that, if you will take any leave during serving notice,
      your last working day may get extended by same number of working days.
    </Typography>
    
    <Typography>
      You are advised to get in touch with HR department for further updates.
    </Typography>
  </DialogContent>
  
  <DialogActions>
    <Button onClick={() => navigate("/profile/exit-details")}>
      OK
    </Button>
  </DialogActions>
</Dialog>
```

---

### 3. ProfilePage Component
**Location:** `src/pages/Profile/index.tsx`

**Purpose:** Main profile page with tabbed interface

**Key Features:**
- Manages tab visibility
- Fetches resignation status for Exit Details tab
- Passes data to EmployeeTabs component

**State Management:**
```typescript
const [resignationStatusData, setResignationStatusData] = useState(null);
```

**API Calls:**
- `getResignationActiveStatus(userId)` - On page load

**Tab Visibility Logic:**
```typescript
useEffect(() => {
  fetchUserProfile();
  fetchResignationActiveStatus();
}, [userData, employeeId]);

const displayExitDetailsTab = resignationStatusData !== null;

const tabs = EmployeeTabs({
  employeeId,
  personalDetails,
  fetchUserProfile,
  canInitiateNewResignation,
  fetchResignationActiveStatus,
  enableITAsset,
  enableExitEmployee,
  displayExitDetailsTab, // ◄── Controls tab visibility
  loadingResignationStatus
});
```

---

### 4. EmployeeTabs Component
**Location:** `src/pages/Profile/components/EmployeeTabs.tsx`

**Purpose:** Builds dynamic tab list for profile page

**Props:**
```typescript
interface EmployeeTabsProps {
  employeeId?: string;
  personalDetails: PersonalDetails;
  fetchUserProfile: () => void;
  canInitiateNewResignation: boolean;
  fetchResignationActiveStatus: () => void;
  enableITAsset: boolean;
  enableExitEmployee: boolean;
  displayExitDetailsTab: boolean; // ◄── Key prop
  loadingResignationStatus: boolean;
}
```

**Tab Configuration:**
```typescript
const tabs = [
  {
    label: "Personal Details",
    path: `personal-details${employeeId ? `?employeeId=${employeeId}` : ""}`,
    canRead: PERSONAL_DETAILS.READ,
    component: <PersonalDetails />
  },
  // ... other tabs ...
  
  // Exit Details Tab (conditionally included)
  ...(enableExitEmployee && displayExitDetailsTab && !loadingResignationStatus
    ? [
        {
          label: "Exit Details",
          component: (
            <ExitDetails
              fetchResignationActiveStatus={fetchResignationActiveStatus}
            />
          ),
          path: `exit-details${employeeId ? `?employeeId=${employeeId}` : ""}`,
        },
      ]
    : []),
];
```

---

### 5. ExitDetails Component
**Location:** `src/pages/Resignation/ExitDetails.tsx`

**Purpose:** Display resignation details and manage actions

**Props:**
```typescript
interface ExitDetailsPageProps {
  fetchResignationActiveStatus: () => void;
}
```

**Key Features:**
- Displays resignation information in grid layout
- Shows status-based action buttons
- Handles revoke and early release
- View dialogs for reasons

**State Management:**
```typescript
const [exitData, setExitData] = useState<GetResignationExitDetails | null>(null);
const [previewType, setPreviewType] = useState<PreviewType | null>(null);
const [isEarlyReleaseDialogOpen, setIsEarlyReleaseDialogOpen] = useState(false);
const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
```

**API Calls:**
1. `getResignationExitDetails(userId)` - Auto-execute on mount
2. `revokeResignation(resignationId)` - On revoke confirm
3. `requestEarlyRelease(payload)` - On early release submit

**Data Display Logic:**
```typescript
const details = useMemo(() => {
  return [
    { label: "Name", value: exitData?.employeeName },
    { label: "Department", value: exitData?.department },
    { label: "Reporting Manager", value: exitData?.reportingManager },
    { label: "Resignation Date", value: formatDate(exitData.resignationDate) },
    { label: "Last Working Day", value: formatDate(exitData.lastWorkingDay) },
    { 
      label: "Resignation Reason",
      customElement: (
        <IconButton onClick={() => setPreviewType("resignationReason")}>
          <VisibilityIcon />
        </IconButton>
      )
    },
    {
      label: "Resignation Status",
      customElement: (
        <Stack direction="row" gap={2}>
          <TruncatedText text={RESIGNATION_STATUS_LABELS[exitData.status]} />
          {exitData.rejectResignationReason && (
            <IconButton onClick={() => setPreviewType("resignationRejectReason")}>
              <VisibilityIcon />
            </IconButton>
          )}
        </Stack>
      )
    },
    // Early Release section (conditional)
    ...(exitData.earlyReleaseDate ? [{
      label: "Early Release Request",
      customElement: (/* Early release display */)
    }] : [])
  ];
}, [exitData]);
```

**Action Button Logic:**
```typescript
// Revoke Button Visibility
const showRevokeButton = 
  exitData &&
  (exitData.status === "RESIGNED_PENDING" || 
   exitData.status === "RESIGNED_ACCEPTED") &&
  moment(exitData.lastWorkingDay).isSameOrAfter(moment(), "day");

// Early Release Button Visibility
const showEarlyReleaseButton = 
  exitData &&
  exitData.status === "RESIGNED_ACCEPTED" &&
  !exitData.earlyReleaseDate &&
  !exitData.earlyReleaseStatus;
```

**Revoke Handler:**
```typescript
const handleRevoke = () => {
  revoke(exitData.id);
  
  onSuccess() {
    toast.success(response.data.message);
    setIsRevokeDialogOpen(false);
    fetchResignationActiveStatus(); // Refresh status
    
    // Navigate back to personal details
    const to = isOwnProfile
      ? "/profile/personal-details"
      : `/profile/personal-details?employeeId=${employeeId}`;
    navigate(to);
  }
};
```

**Rendered UI Structure:**
```tsx
<Box>
  <PageHeader title="Exit Details" />
  
  {/* Data Grid */}
  <Grid container spacing={2}>
    {details.map(({ label, value, customElement }) => (
      <Grid item xs={12} sm={6} md={4}>
        <Typography fontWeight={700}>{label}:</Typography>
        {customElement || <TruncatedText text={value} />}
      </Grid>
    ))}
  </Grid>
  
  {/* Action Buttons */}
  <Stack direction="row" spacing={2}>
    {showRevokeButton && (
      <Button variant="outlined" color="error" onClick={openRevokeDialog}>
        Revoke
      </Button>
    )}
    
    {showEarlyReleaseButton && (
      <Button variant="contained" onClick={openEarlyReleaseDialog}>
        Request Early Release
      </Button>
    )}
  </Stack>
  
  {/* Dialogs */}
  {previewType && (
    <ResignationReasonPreview
      title={previewData.title}
      reason={previewData.content}
      open={!!previewType}
      onClose={() => setPreviewType(null)}
    />
  )}
  
  {isEarlyReleaseDialogOpen && (
    <EarlyReleaseDialog
      open={isEarlyReleaseDialogOpen}
      onClose={() => setIsEarlyReleaseDialogOpen(false)}
      lastWorkingDay={exitData.lastWorkingDay}
      resignationId={exitData.id}
      fetchExitDetails={fetchExitDetails}
    />
  )}
  
  {isRevokeDialogOpen && (
    <ConfirmationDialog
      title="Revoke Resignation?"
      content="Revoking your resignation will terminate..."
      open={isRevokeDialogOpen}
      onClose={() => setIsRevokeDialogOpen(false)}
      onConfirm={handleRevoke}
    />
  )}
</Box>
```

---

### 6. PersonalDetails Component (Secondary Entry Point)
**Location:** `src/pages/Profile/components/PersonalDetails.tsx`

**Purpose:** Personal details tab with resignation link

**Key Feature:**
- Shows link to resignation form
- Same status check logic as ProfileTab

**Rendered Link:**
```tsx
<Typography>
  Click{" "}
  <Typography
    component={Link}
    onClick={(e) => {
      e.preventDefault();
      
      if (canInitiateNewResignation) {
        setOpenResignationDialog(true);
      } else {
        const to = isOwnProfile
          ? "/profile/exit-details"
          : `/profile/exit-details?employeeId=${targetId}`;
        navigate(to);
      }
    }}
  >
    Here
  </Typography>{" "}
  to get Resignation Form
</Typography>
```

---

## Supporting Components

### EarlyReleaseDialog Component
**Location:** `src/pages/Resignation/components/EarlyReleaseDialog/index.tsx`

**Props:**
```typescript
interface EarlyReleaseDialogProps {
  open: boolean;
  onClose: () => void;
  lastWorkingDay: string;
  resignationId: number;
  fetchExitDetails: () => void;
}
```

**Features:**
- Date picker for early release date
- Validation: must be before last working day
- Reason text field

### ResignationReasonPreview Component
**Location:** `src/pages/Resignation/components/ResignationReasonPreview.tsx`

**Props:**
```typescript
interface ResignationReasonPreviewProps {
  title: string;
  reason: string;
  open: boolean;
  onClose: () => void;
}
```

**Purpose:** Simple modal to display full text of resignation/rejection reasons

### ExitEmployeeListPage Component
**Location:** `src/pages/ExitEmployee/ExitEmployeeListPage/index.tsx`

**Purpose:** Admin view - list all employees with resignations

**Features:**
- Table/list of employees with active resignations
- Filter and search capabilities
- Navigate to individual exit details

### ExitDetailsPage Component (Admin View)
**Location:** `src/pages/ExitEmployee/ExitDetailsPage/index.tsx`

**Purpose:** Admin view of specific employee's exit details

**Difference from ExitDetails Component:**
- Additional admin actions
- May show approval/rejection controls
- Uses resignationId from URL params instead of userId

---

## State Management

### Global Store (Zustand)

**useUserStore:**
```typescript
{
  userData: {
    userId: string,
    firstName: string,
    lastName: string,
    roleId: string,
    roleName: string,
    // ...
  },
  isInternalUser: boolean
}
```

**useProfileStore:**
```typescript
{
  userName: string,
  profileImageUrl: string
}
```

**useModulePermissionsStore:**
```typescript
{
  modulePermissions: Permission[]
}
```

---

## Custom Hooks

### useAsync Hook
**Location:** `src/hooks/useAsync.ts`

**Purpose:** Manages async operations with loading states

**Usage Pattern:**
```typescript
const { execute, isLoading } = useAsync<ResponseType, ArgsType>({
  requestFn: async (args) => {
    return await apiCall(args);
  },
  onSuccess: (response) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
  autoExecute: true // Optional
});
```

### useFeatureFlag Hook
**Location:** `src/hooks/useFeatureFlag.ts`

**Purpose:** Check feature flag status

**Usage:**
```typescript
const enableExitEmployee = useFeatureFlag(FEATURE_FLAGS.enableExitEmployee);
```

---

## Service Layer

### EmployeeExit Service
**Location:** `src/services/EmployeeExit.ts`

**API Functions:**

```typescript
// Get active resignation status
export const getResignationActiveStatus = async (
  userId: number
): Promise<ResignationActiveStatusResponse> => {
  const response = await api.get(`/resignation/active-status/${userId}`);
  return response.data;
};

// Get resignation form data
export const getResignationForm = async (
  userId: number
): Promise<GetResignationFormResponse> => {
  const response = await api.get(`/resignation/form/${userId}`);
  return response.data;
};

// Submit resignation
export const addResignation = async (
  args: AddResignationArgs
): Promise<AddResignationResponse> => {
  const response = await api.post('/resignation', args);
  return response.data;
};

// Get exit details
export const getResignationExitDetails = async (
  userId: number
): Promise<GetResignationExitDetailsResponse> => {
  const response = await api.get(`/resignation/exit-details/${userId}`);
  return response.data;
};

// Revoke resignation
export const revokeResignation = async (
  resignationId: number
): Promise<RevokeResignationResponse> => {
  const response = await api.post(`/resignation/revoke/${resignationId}`);
  return response.data;
};

// Request early release
export const requestEarlyRelease = async (
  args: EarlyReleaseArgs
): Promise<EarlyReleaseResponse> => {
  const response = await api.post('/resignation/early-release', args);
  return response.data;
};
```

**Type Definitions:**

```typescript
interface ResignationDetails {
  id: number;
  employeeName: string;
  department: string;
  departmentId: number;
  reportingManagerName: string;
  reportingManagerId: number;
  jobType: string;
}

interface AddResignationArgs {
  employeeId: number;
  departmentId: number;
  reportingManagerId: number;
  jobType: string;
  reason: string;
}

interface GetResignationExitDetails {
  id: number;
  employeeName: string;
  department: string;
  reportingManager: string;
  resignationDate: string;
  lastWorkingDay: string;
  reason: string;
  status: ResignationStatusCode;
  rejectResignationReason?: string;
  earlyReleaseDate?: string;
  earlyReleaseStatus?: EarlyReleaseStatusValue;
  rejectEarlyReleaseReason?: string;
}
```

---

## Utility Functions

### calculateLastWorkingDay
**Location:** `src/utils/helpers.ts`

**Purpose:** Calculate last working day based on job type

```typescript
export const calculateLastWorkingDay = (
  resignationDate: moment.Moment,
  jobType: string
): moment.Moment => {
  // Company exit policy logic
  // Different notice periods based on job type
  
  const noticePeriodDays = getNoticePeriod(jobType);
  return resignationDate.clone().add(noticePeriodDays, 'days');
};
```

### hasPermission
**Location:** `src/utils/hasPermission.ts`

**Purpose:** Check if user has specific permission

```typescript
export const hasPermission = (permission: string): boolean => {
  const { modulePermissions } = useModulePermissionsStore.getState();
  return modulePermissions.some(p => p.code === permission);
};
```

---

## Route Configuration

**Routes related to resignation:**

```typescript
const routes = [
  {
    path: "/resignation-form/:userId?",
    element: (
      <ProtectedRoute>
        <FeatureGuard flag={enableExitEmployee}>
          <ResignationFormPage />
        </FeatureGuard>
      </ProtectedRoute>
    )
  },
  {
    path: "/profile/exit-details",
    element: (
      <ProtectedRoute>
        <FeatureGuard flag={enableExitEmployee}>
          <ProfilePage />
          {/* Exit Details tab within ProfilePage */}
        </FeatureGuard>
      </ProtectedRoute>
    )
  },
  {
    path: "/employees/employee-exit",
    element: (
      <ProtectedRoute>
        <FeatureGuard flag={enableExitEmployee}>
          <ExitEmployeeListPage />
        </FeatureGuard>
      </ProtectedRoute>
    )
  },
  {
    path: "/employees/employee-exit/:resignationId",
    element: (
      <ProtectedRoute>
        <FeatureGuard flag={enableExitEmployee}>
          <ExitDetailsPage />
        </FeatureGuard>
      </ProtectedRoute>
    )
  }
];
```

---

## Component Data Flow

```
User Action: Click "Exit Portal"
    │
    ▼
ProfileTab Component
    │
    ├─► API Call: getResignationActiveStatus(userId)
    │       │
    │       ▼
    │   Response: { resignationStatus: "pending" | null | ... }
    │       │
    │       ├─► If can initiate new
    │       │   └─► Show ConfirmationDialog
    │       │       └─► onConfirm: navigate("/resignation-form")
    │       │
    │       └─► If active resignation exists
    │           └─► navigate("/profile/exit-details")
    │
    ▼
ResignationForm Component
    │
    ├─► API Call: getResignationActiveStatus(userId) [Verify]
    ├─► API Call: getResignationForm(userId) [Load data]
    │       │
    │       ▼
    │   setResignationDetails(data)
    │       │
    │       ▼
    │   Pre-fill form fields (read-only)
    │
    ├─► User fills: resignationReason
    │
    ├─► User clicks: Submit
    │       │
    │       ▼
    │   API Call: addResignation(payload)
    │       │
    │       ▼
    │   onSuccess:
    │       ├─► Calculate resignationDate (today)
    │       ├─► Calculate lastWorkingDay (based on jobType)
    │       └─► Show success dialog
    │           └─► onClick OK: navigate("/profile/exit-details")
    │
    ▼
ProfilePage Component
    │
    ├─► API Call: getResignationActiveStatus(userId)
    │       │
    │       ▼
    │   setResignationStatusData(data)
    │       │
    │       ▼
    │   displayExitDetailsTab = (data !== null)
    │       │
    │       ▼
    │   Pass to EmployeeTabs({
    │       displayExitDetailsTab,
    │       enableExitEmployee,
    │       ...
    │   })
    │
    ▼
EmployeeTabs Component
    │
    └─► Build tabs array
        └─► Include ExitDetails tab if:
            - enableExitEmployee === true
            - displayExitDetailsTab === true
            - !loadingResignationStatus
            │
            ▼
        <ExitDetails fetchResignationActiveStatus={...} />
```

---

## Summary

### Key Architectural Patterns:

1. **Feature Flag Gating:** Entire feature controlled by `enableExitEmployee`
2. **Permission-Based Rendering:** Uses `hasPermission()` for access control
3. **API-Driven UI:** Component visibility and actions based on API responses
4. **Optimistic UI Updates:** Loading states managed via `useAsync` hook
5. **Dialog-Based Confirmations:** Heavy use of confirmation dialogs for critical actions
6. **Memoized Computations:** Uses `useMemo` for derived data
7. **Route-Based Navigation:** Clean separation via React Router
8. **Service Layer Abstraction:** All API calls through service functions
9. **Type Safety:** Full TypeScript usage with defined interfaces

### Component Responsibilities:

- **ProfileTab:** Entry point, status check trigger
- **ResignationForm:** Data collection, validation, submission
- **ProfilePage:** Tab management, status fetching
- **EmployeeTabs:** Dynamic tab generation
- **ExitDetails:** Information display, action management
- **Dialogs:** User confirmations and information display
