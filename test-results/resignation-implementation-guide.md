# Legacy HRMS - Resignation/Exit Flow: Implementation Insights

## Executive Summary

This document provides critical insights from the deep analysis of the legacy HRMS resignation/exit flow, specifically for implementing the same flow in the converted application.

---

## Critical Implementation Points

### 1. Double Status Check Pattern

The legacy app implements a **double-check security pattern**:

```typescript
// First Check: When user clicks "Exit Portal"
ProfileTab → Click Exit Portal
    ↓
getResignationActiveStatus(userId)
    ↓
if (canInitiate) → Show confirmation dialog
else → Navigate to exit details

// Second Check: When resignation form loads
ResignationForm → componentDidMount
    ↓
getResignationActiveStatus(userId) // Verify again!
    ↓
if (!canInitiate) → Navigate to /not-found
else → Load form data
```

**Why This Matters:**
- Prevents race conditions
- Blocks direct URL access to form when not eligible
- Ensures data consistency

**Implementation Recommendation:**
```typescript
// Always check before showing form
useEffect(() => {
  const verifyEligibility = async () => {
    const status = await checkResignationStatus();
    if (!canInitiateNewResignation(status)) {
      navigate('/not-found', { replace: true });
      return;
    }
    // Proceed to load form
    loadFormData();
  };
  
  verifyEligibility();
}, []);
```

---

### 2. Status-Based Navigation Logic

**Key Decision Tree:**

```
Resignation Status Value → UI Behavior
──────────────────────────────────────
null                    → Can initiate new (show dialog)
RESIGNED_PENDING        → Show exit details (can revoke)
RESIGNED_ACCEPTED       → Show exit details (can revoke + early release)
RESIGNED_CANCELLED      → Can initiate new (show dialog)
RESIGNED_REVOKED        → Can initiate new (show dialog)
```

**Critical Code Pattern:**

```typescript
const canInitiateNewResignation = (statusData: ResignationStatus | null): boolean => {
  if (statusData === null) return true;
  
  const allowedStatuses: ResignationStatusCode[] = [
    ResignationStatus.cancelled,
    ResignationStatus.revoked
  ];
  
  return allowedStatuses.includes(statusData.resignationStatus);
};
```

**Implementation Insight:**
- Must handle `null` explicitly (not just falsy check)
- Array-based status checking is more maintainable than multiple conditions
- Status check is reused in multiple places → extract to utility function

---

### 3. Tab Visibility Algorithm

**Complex Logic:**

```typescript
// Exit Details Tab Visibility
const shouldShowExitDetailsTab = 
  enableExitEmployee &&           // Feature flag
  resignationStatusData !== null && // Has ANY resignation record
  !loadingResignationStatus;      // Not currently loading
```

**Critical Points:**
- Tab shows for ALL statuses (pending, accepted, cancelled, revoked)
- Tab ONLY hides when `resignationStatusData === null`
- Loading state must hide tab temporarily to prevent flickering

**Implementation Pattern:**

```typescript
const [resignationStatus, setResignationStatus] = useState<ResignationStatus | null>(null);
const [isLoadingStatus, setIsLoadingStatus] = useState(true);

useEffect(() => {
  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await getResignationActiveStatus(userId);
      setResignationStatus(data);
    } finally {
      setIsLoadingStatus(false);
    }
  };
  
  fetchStatus();
}, [userId]);

// In tab configuration
const tabs = [
  // ... other tabs
  ...(enableExitEmployee && resignationStatus !== null && !isLoadingStatus
    ? [{
        label: "Exit Details",
        component: <ExitDetails />
      }]
    : []
  )
];
```

---

### 4. Last Working Day Calculation

**Critical Business Logic:**

```typescript
// From ResignationForm component
onSuccess: ({ data }) => {
  const today = moment();
  setResignationDate(today);
  
  const jobType = resignationDetails?.jobType;
  if (!isValidJobType(jobType)) {
    console.error("Invalid job type", jobType);
    return;
  }
  
  // CRITICAL: Different notice periods by job type
  setLastWorkingDay(calculateLastWorkingDay(today, jobType));
}
```

**Implementation Requirements:**
1. Notice period varies by `jobType` field
2. Must validate jobType exists and is valid
3. Calculation happens on **frontend** after submission success
4. Backend also calculates (for verification)
5. Users see the date immediately in success dialog

**Example Implementation:**

```typescript
export const calculateLastWorkingDay = (
  resignationDate: Moment,
  jobType: string
): Moment => {
  // Company policy: Notice period by job type
  const noticePeriodMap: Record<string, number> = {
    'PERMANENT': 60,     // 60 days
    'CONTRACT': 30,      // 30 days
    'PROBATION': 15,     // 15 days
    'INTERN': 7          // 7 days
  };
  
  const noticeDays = noticePeriodMap[jobType] || 30; // Default 30
  
  // Add business days logic here if needed
  return resignationDate.clone().add(noticeDays, 'days');
};

export const isValidJobType = (jobType: string | undefined): boolean => {
  const validTypes = ['PERMANENT', 'CONTRACT', 'PROBATION', 'INTERN'];
  return jobType !== undefined && validTypes.includes(jobType);
};
```

---

### 5. Revoke Button Visibility Logic

**Complex Conditional:**

```typescript
const showRevokeButton = useMemo(() => {
  if (!exitData) return false;
  
  // Status must be pending OR accepted
  const allowedStatuses = [
    ResignationStatus.pending,
    ResignationStatus.accepted
  ];
  
  if (!allowedStatuses.includes(exitData.status)) {
    return false;
  }
  
  // Last working day must be today or in future
  const isLastWorkingDayValid = moment(exitData.lastWorkingDay)
    .isSameOrAfter(moment(), 'day');
  
  return isLastWorkingDayValid;
}, [exitData]);
```

**Key Insights:**
- **Time-based validation**: Compare dates using moment.js
- **Status-based validation**: Only certain statuses allow revoke
- **Memoization**: Prevents unnecessary recalculations
- **Day granularity**: Use `.isSameOrAfter(moment(), 'day')` not just date comparison

**Edge Cases to Handle:**
```typescript
// Case 1: Last working day is today (should allow revoke)
lastWorkingDay = "2025-11-20", today = "2025-11-20" → TRUE

// Case 2: Last working day was yesterday (should NOT allow)
lastWorkingDay = "2025-11-19", today = "2025-11-20" → FALSE

// Case 3: Status is cancelled (should NOT allow revoke)
status = "RESIGNED_CANCELLED" → FALSE (even if date is future)
```

---

### 6. Early Release Button Logic

**Simplified but Critical:**

```typescript
const showEarlyReleaseButton = useMemo(() => {
  if (!exitData) return false;
  
  // Three conditions ALL must be true:
  return (
    exitData.status === ResignationStatus.accepted &&  // 1. Must be accepted
    !exitData.earlyReleaseDate &&                     // 2. No date set
    !exitData.earlyReleaseStatus                      // 3. No status set
  );
}, [exitData]);
```

**Key Points:**
- Only appears when status = ACCEPTED
- Disappears after first early release request (regardless of approval)
- Cannot request early release on pending resignation
- One-shot feature: Can't request again if rejected

**Implementation Note:**
```typescript
// Early release data structure
interface ExitData {
  // ... other fields
  earlyReleaseDate?: string;      // Optional
  earlyReleaseStatus?: string;    // Optional
  rejectEarlyReleaseReason?: string; // Optional
}

// If early release was requested, these fields will be populated
// If never requested, all three will be undefined/null
```

---

### 7. Dialog Chaining Pattern

**Complex UX Flow:**

```
User Action              Dialog State                Next State
─────────────────────────────────────────────────────────────────
Click "Exit Portal"  →   Confirmation Dialog   →    (Cancel or Confirm)
                                ↓
                          Click Confirm
                                ↓
                         Navigate to Form
                                ↓
                          Fill and Submit
                                ↓
                         Success Dialog     →     (Click OK)
                                ↓
                         Navigate to Exit Details
```

**State Management Pattern:**

```typescript
// In ResignationForm component
const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
const [resignationDate, setResignationDate] = useState<Moment | null>(null);
const [lastWorkingDay, setLastWorkingDay] = useState<Moment | null>(null);

const onSubmit = async (values) => {
  const response = await addResignation(values);
  
  // Don't navigate immediately!
  // First show success dialog with calculated dates
  const today = moment();
  setResignationDate(today);
  setLastWorkingDay(calculateLastWorkingDay(today, jobType));
  setOpenConfirmationDialog(true); // Show dialog
};

// In success dialog
<Button onClick={() => {
  navigate("/profile/exit-details", { replace: true });
}}>
  OK
</Button>
```

**Critical Implementation Points:**
1. State calculation happens BEFORE dialog shows
2. Dialog shows dates immediately (no loading)
3. Navigation happens on dialog close, not on API success
4. Use `{ replace: true }` to prevent back button issues

---

### 8. API Response Handling Pattern

**Consistent Pattern Across Components:**

```typescript
const { execute: fetchData, isLoading } = useAsync<ResponseType>({
  requestFn: async (): Promise<ResponseType> => {
    return await apiFunction(params);
  },
  onSuccess: ({ data }) => {
    // Extract result from data.result
    const result = data.result;
    setState(result);
  },
  onError: (err) => {
    // Use utility to show error toast
    methods.throwApiError(err);
  },
  autoExecute: false // or true
});
```

**Response Structure:**

```typescript
// All API responses follow this structure
interface ApiResponse<T> {
  data: {
    message: string;
    result: T;
    success: boolean;
  };
  status: number;
}

// Example: Resignation Status Response
{
  data: {
    message: "Success",
    result: {
      resignationStatus: "RESIGNED_PENDING"
    },
    success: true
  },
  status: 200
}

// Example: Exit Details Response
{
  data: {
    message: "Success",
    result: {
      id: 123,
      employeeName: "John Doe",
      status: "RESIGNED_PENDING",
      // ... other fields
    },
    success: true
  },
  status: 200
}
```

**Implementation Pattern:**

```typescript
// CORRECT: Extract from data.result
onSuccess: ({ data }) => {
  setExitData(data.result); // ✓
}

// WRONG: Use data directly
onSuccess: ({ data }) => {
  setExitData(data); // ✗ - This will be the wrapper object
}
```

---

### 9. Form Validation & Submission Pattern

**Comprehensive Validation:**

```typescript
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

// Validation schema
const validationSchema = Yup.object().shape({
  employeeName: Yup.string().trim().required("Employee name is required"),
  department: Yup.string().trim().required("Department is required"),
  reportingManager: Yup.string().trim().required("Reporting manager is required"),
  resignationReason: Yup.string()
    .trim()
    .required("Resignation reason is required")
    .max(500, "Maximum 500 characters allowed")
});

// Form setup
const method = useForm<FormDataType>({
  resolver: yupResolver(validationSchema),
  defaultValues: {
    employeeName: "",
    department: "",
    reportingManager: "",
    resignationReason: ""
  }
});

// Pre-fill read-only fields
useEffect(() => {
  if (resignationDetails) {
    method.reset({
      employeeName: resignationDetails.employeeName,
      department: resignationDetails.department,
      reportingManager: resignationDetails.reportingManagerName,
      resignationReason: "" // Keep empty
    });
  }
}, [resignationDetails]);

// Submission
const onSubmit = (values: FormDataType) => {
  if (!resignationDetails) return;
  
  // Send IDs, not names
  add({
    employeeId: resignationDetails.id,
    departmentId: resignationDetails.departmentId,
    reportingManagerId: resignationDetails.reportingManagerId,
    jobType: resignationDetails.jobType,
    reason: values.resignationReason
  });
};
```

**Key Points:**
1. **Display vs. Submission Data**: Form shows names, API sends IDs
2. **Read-only Fields**: Still validated but user can't edit
3. **Reset Pattern**: Use `reset()` to update form values
4. **Trim Values**: All strings are trimmed in validation
5. **Max Length**: Enforce on frontend and backend

---

### 10. Permission & Feature Flag Pattern

**Multi-Layer Access Control:**

```typescript
// Layer 1: Feature Flag (Global enable/disable)
const enableExitEmployee = useFeatureFlag(FEATURE_FLAGS.enableExitEmployee);

// Layer 2: Route Protection
<Route path="/resignation-form/:userId?">
  <ProtectedRoute> {/* Auth check */}
    <FeatureGuard flag={enableExitEmployee}> {/* Feature check */}
      <ResignationFormPage />
    </FeatureGuard>
  </ProtectedRoute>
</Route>

// Layer 3: Permission Check (for admin viewing others)
useEffect(() => {
  if (paramId && paramId !== String(currentUserId)) {
    if (!hasPermission(EMPLOYEES.READ)) {
      navigate("/unauthorized", { replace: true });
      return;
    }
  }
  
  // Proceed to load data
  fetchData();
}, [paramId, currentUserId]);

// Layer 4: Component-level rendering
{enableExitEmployee && hasPermission(EMPLOYEES.READ) && (
  <ListItemButton onClick={handleExitPortal}>
    <ExitToAppIcon />
    <ListItemText primary="Exit Portal" />
  </ListItemButton>
)}
```

**Access Matrix:**

| Scenario | Feature Flag | Permission | Result |
|----------|--------------|------------|---------|
| Employee viewing own | Enabled | N/A | ✓ Allow |
| Employee viewing own | Disabled | N/A | ✗ Block |
| Admin viewing other | Enabled | Has READ | ✓ Allow |
| Admin viewing other | Enabled | No READ | ✗ Block |
| Admin viewing other | Disabled | Has READ | ✗ Block |

---

### 11. URL Parameter Handling

**Self vs. Other Employee Pattern:**

```typescript
// In component
const { userId: paramId } = useParams<{ userId?: string }>();
const { userData } = useUserStore();
const currentUserId = userData.userId;

// Determine target
const targetId = paramId ?? String(currentUserId);
const isOwnProfile = targetId === String(currentUserId);

// Navigation patterns
const navigateToExitDetails = () => {
  const to = isOwnProfile
    ? "/profile/exit-details"
    : `/profile/exit-details?employeeId=${paramId}`;
  
  navigate(to);
};

// API call pattern
const fetchData = async () => {
  return await getResignationExitDetails(Number(targetId));
};
```

**URL Patterns:**

```
Own Profile Access:
  /resignation-form
  /profile/exit-details

Admin Access (Other Employee):
  /resignation-form/123
  /profile/exit-details?employeeId=123

Admin List View:
  /employees/employee-exit
  /employees/employee-exit/456  (resignationId, not userId!)
```

**Critical Distinction:**
- Profile routes use `userId`
- Admin list routes use `resignationId`
- Query params vs. path params vary by route

---

### 12. Loading State Management

**Multi-Level Loading Pattern:**

```typescript
// Component level
const [isLoading, setIsLoading] = useState(true);

// API call level (via useAsync)
const { execute, isLoading: isLoadingApi } = useAsync({...});

// Global loader for blocking operations
const [isSubmitting, setIsSubmitting] = useState(false);

// Conditional rendering
if (isLoading || isLoadingApi) {
  return <GlobalLoader loading />;
}

// During submission
<GlobalLoader loading={isSubmitting} />
```

**Loading Hierarchy:**

```
1. Page Level Loading (initial data fetch)
   └─► Show full-page loader
   
2. Action Level Loading (button clicks)
   └─► Disable button, show spinner
   
3. Background Loading (status checks)
   └─► No UI indication, silent update
```

**Implementation:**

```typescript
// Pattern 1: Initial Load
useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);
    try {
      await fetchExitDetails();
      await fetchResignationStatus();
    } finally {
      setIsLoading(false);
    }
  };
  loadData();
}, []);

if (isLoading) {
  return <GlobalLoader loading />;
}

// Pattern 2: Button Action
<Button
  disabled={isSubmitting}
  onClick={async () => {
    setIsSubmitting(true);
    try {
      await submitResignation();
    } finally {
      setIsSubmitting(false);
    }
  }}
>
  {isSubmitting ? <CircularProgress size={20} /> : 'Submit'}
</Button>

// Pattern 3: Silent Background Check
const { execute: checkStatus } = useAsync({
  requestFn: getResignationActiveStatus,
  onSuccess: (data) => {
    // Update state silently
    setStatus(data.result);
  }
});
```

---

## Data Structure Reference

### Resignation Status Response

```typescript
interface ResignationActiveStatusResponse {
  data: {
    result: {
      resignationStatus: ResignationStatusCode;
    } | null;
    message: string;
    success: boolean;
  };
}

type ResignationStatusCode = 
  | "RESIGNED_PENDING"
  | "RESIGNED_ACCEPTED"
  | "RESIGNED_CANCELLED"
  | "RESIGNED_REVOKED";
```

### Exit Details Response

```typescript
interface GetResignationExitDetails {
  id: number;
  employeeName: string;
  department: string;
  reportingManager: string;
  resignationDate: string;          // ISO date string
  lastWorkingDay: string;           // ISO date string
  reason: string;
  status: ResignationStatusCode;
  rejectResignationReason?: string;
  earlyReleaseDate?: string;        // ISO date string
  earlyReleaseStatus?: EarlyReleaseStatusValue;
  rejectEarlyReleaseReason?: string;
}

type EarlyReleaseStatusValue =
  | "EARLY_RELEASE_PENDING"
  | "EARLY_RELEASE_APPROVED"
  | "EARLY_RELEASE_REJECTED";
```

### Form Submission Payload

```typescript
interface AddResignationArgs {
  employeeId: number;
  departmentId: number;
  reportingManagerId: number;
  jobType: string;
  reason: string;
}
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Direct Form Access

**Problem:** User can navigate directly to `/resignation-form` bypassing status check

**Solution:**
```typescript
useEffect(() => {
  // MUST verify eligibility on form load
  const verify = async () => {
    const status = await getResignationActiveStatus(userId);
    if (!canInitiate(status)) {
      navigate('/not-found', { replace: true });
    }
  };
  verify();
}, []);
```

### Pitfall 2: Stale Status Data

**Problem:** Status checked once, but user actions don't refresh it

**Solution:**
```typescript
// After revoke, refresh status
const handleRevoke = async () => {
  await revokeResignation(id);
  await fetchResignationActiveStatus(); // ← Refresh!
  navigate('/profile/personal-details');
};
```

### Pitfall 3: Race Condition in Tab Visibility

**Problem:** Tab flickers or shows incorrectly during load

**Solution:**
```typescript
const [isLoadingStatus, setIsLoadingStatus] = useState(true);

// Hide tab during loading
const showExitTab = 
  enableExitEmployee &&
  statusData !== null &&
  !isLoadingStatus; // ← Prevents flicker
```

### Pitfall 4: Date Comparison Issues

**Problem:** Date comparison fails due to time component

**Solution:**
```typescript
// WRONG
moment(lastWorkingDay) >= moment() // Compares with time

// CORRECT
moment(lastWorkingDay).isSameOrAfter(moment(), 'day') // Day granularity
```

### Pitfall 5: Missing Error Handling

**Problem:** API errors crash the app or show no feedback

**Solution:**
```typescript
const { execute } = useAsync({
  requestFn: apiCall,
  onSuccess: handleSuccess,
  onError: (err) => {
    methods.throwApiError(err); // Shows toast
    // Also handle UI state
    setIsLoading(false);
  }
});
```

---

## Testing Checklist

### Functional Testing

- [ ] Can initiate resignation when no active resignation
- [ ] Cannot initiate when active resignation exists
- [ ] Can initiate after cancellation
- [ ] Can initiate after revoke
- [ ] Form validates resignation reason (required, max length)
- [ ] Success dialog shows correct dates
- [ ] Exit Details tab appears after submission
- [ ] Exit Details tab hidden when no resignation
- [ ] Revoke button appears when status = pending/accepted
- [ ] Revoke button hidden when last working day passed
- [ ] Revoke button hidden when status = cancelled/revoked
- [ ] Early Release button appears only when status = accepted
- [ ] Early Release button hidden after first request
- [ ] View dialogs work for all reason types
- [ ] Navigation works for self and admin viewing others
- [ ] Permissions checked for admin access

### Edge Cases

- [ ] Direct URL access to form (should verify eligibility)
- [ ] Direct URL access to exit details (should check if exists)
- [ ] Concurrent status change (user has two tabs open)
- [ ] Network errors handled gracefully
- [ ] Invalid job type handled
- [ ] Missing resignation data handled
- [ ] Feature flag toggle mid-session
- [ ] Permission revoked mid-session

### UI/UX Testing

- [ ] Loading states show appropriately
- [ ] No flicker in tab visibility
- [ ] Dialogs are modal and block interaction
- [ ] Success messages clear and informative
- [ ] Error messages actionable
- [ ] Back button behavior correct
- [ ] Breadcrumbs accurate
- [ ] Mobile responsive

---

## Migration Considerations

### From Legacy to Converted App

**Key Differences to Watch:**

1. **Framework Change:**
   - Legacy: Vite + React
   - Converted: Next.js + React
   - Impact: Navigation patterns, routing, SSR considerations

2. **State Management:**
   - Legacy: Zustand
   - Converted: ? (Verify current implementation)
   - Impact: Store access patterns

3. **API Layer:**
   - Legacy: .NET Core 8 API
   - Converted: Laravel API
   - Impact: Response structure, error handling

4. **Date Library:**
   - Legacy: moment.js
   - Converted: Consider date-fns or Day.js (moment is deprecated)
   - Impact: All date calculations need update

5. **Form Handling:**
   - Legacy: React Hook Form + Yup
   - Converted: Verify if same
   - Impact: Validation patterns

### Recommended Migration Steps

1. **Phase 1: Backend API**
   - [ ] Implement all resignation endpoints in Laravel
   - [ ] Match response structures exactly
   - [ ] Test all status scenarios

2. **Phase 2: Core Components**
   - [ ] Port ResignationForm component
   - [ ] Port ExitDetails component
   - [ ] Implement status check utility

3. **Phase 3: Integration**
   - [ ] Add Exit Portal to profile menu
   - [ ] Implement tab visibility logic
   - [ ] Wire up all navigation

4. **Phase 4: Edge Cases**
   - [ ] Implement all dialog flows
   - [ ] Add permission checks
   - [ ] Feature flag integration

5. **Phase 5: Testing**
   - [ ] E2E tests with Playwright
   - [ ] Unit tests for utilities
   - [ ] Integration tests for API

---

## Performance Considerations

### API Call Optimization

```typescript
// AVOID: Multiple sequential calls
const loadPage = async () => {
  await fetchStatus();
  await fetchDetails();
  await fetchProfile();
};

// PREFER: Parallel calls where possible
const loadPage = async () => {
  await Promise.all([
    fetchStatus(),
    fetchDetails(),
    fetchProfile()
  ]);
};
```

### Memoization

```typescript
// Use useMemo for expensive computations
const displayDetails = useMemo(() => {
  if (!exitData) return null;
  
  return [
    { label: "Name", value: exitData.employeeName },
    // ... complex transformations
  ];
}, [exitData]); // Only recalculate when exitData changes
```

### Lazy Loading

```typescript
// Lazy load resignation components (they're not always needed)
const ResignationFormPage = lazyWithRetry(
  () => import("@/pages/Resignation/ResignationForm")
);

const ExitDetailsPage = lazyWithRetry(
  () => import("@/pages/ExitEmployee/ExitDetailsPage/index")
);
```

---

## Security Considerations

1. **Always Verify Server-Side:**
   - Frontend checks are for UX only
   - Backend must validate all resignations
   - Never trust client-side date calculations

2. **Permission Enforcement:**
   - Check permissions on every API call
   - Frontend guards are supplementary
   - Backend is the source of truth

3. **Data Exposure:**
   - Limit data in resignation status API
   - Full details only when authorized
   - Sensitive fields (rejection reasons) only for involved parties

4. **CSRF Protection:**
   - All POST requests must include CSRF token
   - Implement in Laravel API properly

5. **Rate Limiting:**
   - Limit resignation submissions (prevent spam)
   - Rate limit status check API
   - Implement on backend

---

## Conclusion

The legacy resignation/exit flow is a well-architected feature with:
- Multiple layers of validation
- Clear separation of concerns
- Comprehensive error handling
- Status-driven UI logic
- Permission-based access control

Key to successful implementation:
1. Replicate the double-check pattern
2. Maintain status-based UI logic exactly
3. Preserve tab visibility algorithm
4. Implement all dialog flows
5. Test all edge cases thoroughly

This analysis provides all necessary information to implement the feature in the converted application while maintaining the same user experience and business logic.
