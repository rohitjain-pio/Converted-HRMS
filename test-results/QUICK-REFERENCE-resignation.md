# Resignation Flow - Quick Reference Card

## 📍 Navigation Flow (One-Pager)

```
START: User clicks Avatar → "Exit Portal"
    ↓
API Check: getResignationActiveStatus(userId)
    ↓
┌────────────────────────────────────┐
│ Status = null OR cancelled/revoked │
└────────────────────────────────────┘
    ↓
Confirmation Dialog
"Are you sure you want to resign?"
    ↓ [Confirm]
Navigate: /resignation-form
    ↓
Load: Employee data (read-only)
Fill: Resignation reason (required)
    ↓ [Submit]
API Post: /resignation
    ↓
Success Dialog
Shows: Resignation Date + Last Working Day
    ↓ [OK]
Navigate: /profile/exit-details
    ↓
EXIT DETAILS TAB APPEARS
Shows: All resignation info + Actions
```

---

## 🔑 Status Decision Matrix

| Status | Initiate New? | Show Tab? | Revoke? | Early Release? |
|--------|---------------|-----------|---------|----------------|
| **null** | ✅ Yes | ❌ No | N/A | N/A |
| **PENDING** | ❌ No | ✅ Yes | ✅ Yes* | ❌ No |
| **ACCEPTED** | ❌ No | ✅ Yes | ✅ Yes* | ✅ Yes** |
| **CANCELLED** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **REVOKED** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |

**\* = If last working day >= today**  
**\*\* = If no prior early release request**

---

## 📡 API Endpoints Quick Ref

| # | Method | Endpoint | When Called |
|---|--------|----------|-------------|
| 1 | GET | `/resignation/active-status/{userId}` | Exit Portal click, Form load, Tab visibility check |
| 2 | GET | `/resignation/form/{userId}` | Form page load |
| 3 | POST | `/resignation` | Form submit |
| 4 | GET | `/resignation/exit-details/{userId}` | Exit Details page load |
| 5 | POST | `/resignation/revoke/{resignationId}` | Revoke button click |
| 6 | POST | `/resignation/early-release` | Early Release submit |

---

## 🎯 Critical Logic Snippets

### Can Initiate Check
```typescript
const canInitiate = (status: Status | null): boolean => {
  if (status === null) return true;
  return ['RESIGNED_CANCELLED', 'RESIGNED_REVOKED'].includes(status);
};
```

### Tab Visibility
```typescript
const showExitTab = 
  enableExitEmployee && 
  resignationStatus !== null && 
  !isLoadingStatus;
```

### Revoke Visibility
```typescript
const showRevoke = 
  ['RESIGNED_PENDING', 'RESIGNED_ACCEPTED'].includes(status) &&
  moment(lastWorkingDay).isSameOrAfter(moment(), 'day');
```

### Early Release Visibility
```typescript
const showEarlyRelease = 
  status === 'RESIGNED_ACCEPTED' &&
  !earlyReleaseDate &&
  !earlyReleaseStatus;
```

---

## 🧩 Component Map

```
ProfileTab (Header)
  ├─ Shows: Exit Portal button
  └─ Calls: getResignationActiveStatus()

ResignationForm
  ├─ URL: /resignation-form/:userId?
  ├─ Calls: getResignationActiveStatus(), getResignationForm()
  └─ Submits to: /resignation

ProfilePage → EmployeeTabs
  ├─ Checks: resignation status
  └─ Shows: Exit Details tab if status !== null

ExitDetails (Tab)
  ├─ Calls: getResignationExitDetails()
  ├─ Shows: Revoke button (conditional)
  ├─ Shows: Early Release button (conditional)
  └─ Dialogs: Reason preview, Revoke confirm, Early Release form
```

---

## 🎨 Dialog Summary

| Dialog | Trigger | Buttons | Action |
|--------|---------|---------|--------|
| **Resignation Confirmation** | Exit Portal click (if can initiate) | Cancel, Confirm | Navigate to form |
| **Resignation Success** | Form submit success | OK | Navigate to exit details |
| **Reason Preview** | View icon click | Close | Display only |
| **Revoke Confirmation** | Revoke button click | Cancel, Confirm | Call revoke API |
| **Early Release Form** | Request button click | Cancel, Submit | Call early release API |

---

## ⚠️ Common Pitfalls

1. **Forgot Second Status Check**: Always verify on form load!
2. **Direct URL Access**: Form page must check eligibility
3. **Stale Status**: Refresh after revoke/actions
4. **Tab Flicker**: Hide during loading
5. **Date Comparison**: Use day granularity, not time

---

## 📋 Testing Quick Checklist

**Happy Path:**
- [ ] Exit Portal → Confirm → Form → Submit → Success → Exit Details

**Edge Cases:**
- [ ] Direct form URL (should verify)
- [ ] Click Exit Portal with active resignation (should skip dialog)
- [ ] Revoke on last working day (should allow)
- [ ] Revoke after last working day (should hide button)
- [ ] Early release after acceptance (should show)
- [ ] Early release on pending (should hide)

**Permissions:**
- [ ] Employee view own resignation
- [ ] Admin view other's resignation (requires EMPLOYEES.READ)
- [ ] Feature flag disabled (hide entire feature)

---

## 🔒 Security Checklist

- [ ] Backend validates all resignations
- [ ] Permission checks on all APIs
- [ ] Status verified server-side
- [ ] CSRF protection on POST
- [ ] Rate limiting on submissions

---

## 📱 Responsive Breakpoints

| Screen | Grid Columns | Dialog Width |
|--------|--------------|--------------|
| Desktop (>1200px) | 3 columns | 500-600px |
| Tablet (768-1200px) | 2 columns | 90% |
| Mobile (<768px) | 1 column | Full width |

---

## 🎨 Color Codes

```
Status Colors:
🟡 Pending      #FFA726 (Orange)
✅ Accepted     #66BB6A (Green)
❌ Cancelled    #EF5350 (Red)
🔄 Revoked      #9E9E9E (Gray)

Button Colors:
Primary         #1e75bb (Blue)
Secondary       #666666 (Gray)
Destructive     #d32f2f (Red)
```

---

## 🚀 Implementation Priority

**Week 1-2: Backend**
- Implement 6 API endpoints
- Match response structures
- Add validation

**Week 3-4: Components**
- ResignationForm
- ExitDetails
- All dialogs

**Week 5: Integration**
- Profile menu
- Tab system
- Routes

**Week 6: Admin (Optional)**
- List page
- Admin actions

**Week 7-8: Testing**
- Unit tests
- E2E tests
- Manual QA

---

## 📞 Quick Help

| Issue | Check Document |
|-------|----------------|
| Don't understand flow | resignation-flow-diagram-detailed.md |
| Need API details | legacy-resignation-flow-analysis.md |
| Implementing component | resignation-component-structure.md |
| Hit a problem | resignation-implementation-guide.md (Pitfalls section) |
| UI/styling questions | resignation-ui-reference.md |
| Testing | legacy-resignation-e2e-test.ts |

---

## 🎓 Key Learnings

1. **Always double-check eligibility** (click + load)
2. **Status drives everything** (UI, actions, navigation)
3. **Tab visibility is simple** (status !== null)
4. **Buttons have complex logic** (status + date + prior requests)
5. **Dialog chaining is critical** (user experience flow)
6. **Feature flag controls all** (can disable entire feature)
7. **Permissions layer on top** (admin vs employee access)

---

## 🔗 File Paths

**Analysis Docs:**
`test-results/resignation-*.md`

**Legacy Code:**
- Components: `Legacy-Folder/Frontend/.../src/pages/Resignation/`
- Services: `Legacy-Folder/Frontend/.../src/services/EmployeeExit.ts`
- Profile: `Legacy-Folder/Frontend/.../src/layout/Dashboard/Header/.../ProfileTab.tsx`

**Test Script:**
`test-results/legacy-resignation-e2e-test.ts`

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Read all docs | 3-4 hours |
| Understand flow | 1 hour |
| Implement backend | 2 weeks |
| Implement frontend | 2 weeks |
| Testing | 1-2 weeks |
| **Total** | **5-6 weeks** |

---

**Print this card for quick reference while coding!** 📄

---

For complete details, see: `INDEX-resignation-analysis.md`
