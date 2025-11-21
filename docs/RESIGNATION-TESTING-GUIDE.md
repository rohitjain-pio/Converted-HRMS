# Employee Resignation Self-Service - Testing Guide

## Prerequisites
1. Backend server running (Laravel)
2. Frontend development server running (Vue + Vite)
3. Valid employee user account with authentication
4. Database with employee and employment_details data

## Test Environment Setup

### 1. Start Backend Server
```bash
cd hrms-backend
php artisan serve
```

### 2. Start Frontend Server
```bash
cd hrms-frontend
npm run dev
```

### 3. Login as Employee
- Navigate to: `http://localhost:5173` (or your configured port)
- Login with employee credentials
- Ensure authentication is working

## Test Scenarios

### Scenario 1: First-Time Resignation Submission

**Objective:** Test new resignation submission flow

**Steps:**
1. ✅ Login as employee who has NO existing resignation
2. ✅ Click on user profile icon (top-right corner)
3. ✅ Click "Exit / Resignation" menu item
4. ✅ **Expected:** Confirmation dialog appears with message:
   ```
   Are you sure you want to initiate resignation?
   
   This will start the resignation process. You will need to:
   - Submit your reason for leaving
   - Complete exit formalities
   - Serve notice period
   ```
5. ✅ Click "Cancel" button
   - **Expected:** Dialog closes, stays on current page
6. ✅ Click "Exit / Resignation" again
7. ✅ Click "Proceed" button
   - **Expected:** Navigate to `/resignation` (Resignation Form Page)
8. ✅ Verify form displays:
   - Employee Name (read-only, pre-filled)
   - Employee ID (read-only, pre-filled)
   - Email (read-only, pre-filled)
   - Department (read-only, pre-filled)
   - Designation (read-only, pre-filled)
   - Resignation Reason textarea (empty, editable)
   - Exit interview checkbox (unchecked)
   - Notice Period display
9. ✅ Try submitting with empty reason
   - **Expected:** Form shows validation error "Please provide a reason"
10. ✅ Enter reason with less than 10 characters (e.g., "Leaving")
    - **Expected:** Form shows error "Reason must be at least 10 characters"
11. ✅ Enter valid reason (10-500 characters):
    ```
    I am resigning due to better career opportunities and personal growth. 
    I have accepted a position at another company.
    ```
12. ✅ Check "Exit interview given" checkbox (optional)
13. ✅ Click "Submit" button
    - **Expected:** Loading state appears on button
14. ✅ **Expected:** Success dialog appears with:
    - Success icon
    - Message: "Resignation Submitted Successfully"
    - "Your resignation has been submitted. Resignation ID: #[number]"
    - "View Details" button
15. ✅ Click "View Details" button
    - **Expected:** Navigate to `/profile?tab=exit-details`
    - **Expected:** Exit Details tab is active and visible
    - **Expected:** Shows resignation information

**Pass Criteria:**
- ✅ Form validation works correctly
- ✅ Resignation submits successfully
- ✅ Success dialog shows resignation ID
- ✅ Auto-navigates to profile Exit Details tab
- ✅ Exit Details tab displays submitted resignation

---

### Scenario 2: Viewing Existing Resignation

**Objective:** Test navigation to existing resignation

**Steps:**
1. ✅ Login as employee who HAS existing resignation
2. ✅ Click on user profile icon (top-right)
3. ✅ Click "Exit / Resignation" menu item
4. ✅ **Expected:** NO confirmation dialog appears
5. ✅ **Expected:** Directly navigate to `/profile?tab=exit-details`
6. ✅ **Expected:** Profile page opens with Exit Details tab active
7. ✅ Verify Exit Details tab shows:
   - Status Timeline with 4 stages
   - Resignation Information card
   - Status badge (Pending/Accepted/Rejected/Revoked)
   - Submission date
   - Last working day
   - Resignation reason
   - Action buttons (based on status)

**Pass Criteria:**
- ✅ No dialog shown when resignation exists
- ✅ Direct navigation to profile exit-details tab
- ✅ All resignation details display correctly
- ✅ Timeline shows correct status

---

### Scenario 3: Profile Page Tab Integration

**Objective:** Test profile page tab structure and Exit Details visibility

**Steps:**
1. ✅ Navigate to `/profile` directly (via URL or "My Profile" menu)
2. ✅ **If NO resignation:** Verify tabs visible:
   - Personal Details
   - Employment Details
   - Official Details
   - Exit Details tab is NOT visible
3. ✅ **If HAS resignation:** Verify tabs visible:
   - Personal Details
   - Employment Details
   - Official Details
   - Exit Details (tab IS visible)
4. ✅ Click on "Exit Details" tab
   - **Expected:** Tab activates, URL changes to `/profile?tab=exit-details`
   - **Expected:** Shows resignation details
5. ✅ Refresh page while on Exit Details tab
   - **Expected:** Page reloads with Exit Details tab still active
   - **Expected:** Resignation data loads correctly
6. ✅ Navigate to other tabs and back to Exit Details
   - **Expected:** Tab switching works smoothly
   - **Expected:** Data persists

**Pass Criteria:**
- ✅ Exit Details tab only visible when resignation exists
- ✅ Tab navigation works correctly
- ✅ URL query parameter (?tab=) updates correctly
- ✅ Page refresh maintains active tab

---

### Scenario 4: Status Timeline Visualization

**Objective:** Test timeline display for different resignation statuses

**Test Cases:**

#### Case 4A: Pending Resignation (Status = 1)
1. ✅ View resignation with Status = 1 (Pending)
2. ✅ Verify timeline shows:
   - ✅ Stage 1 (Submitted): Green check, with submission date
   - ⏱️ Stage 2 (Under Review): Grey clock, "Awaiting manager approval"
   - ⏱️ Stage 3 (Clearance Process): Grey clock, "Pending approval"
   - ⏱️ Stage 4 (Completion): Grey clock, with last working day date
3. ✅ Verify status badge shows "Pending" in yellow/warning color

#### Case 4B: Accepted Resignation (Status = 2)
1. ✅ View resignation with Status = 2 (Accepted)
2. ✅ Verify timeline shows:
   - ✅ Stage 1 (Submitted): Green check
   - ✅ Stage 2 (Under Review): Green check, "Approved by management"
   - ✅ Stage 3 (Clearance Process): Green check, "Exit clearances in progress"
   - ⏱️ Stage 4 (Completion): Grey clock
3. ✅ Verify status badge shows "Accepted" in green/success color

#### Case 4C: Rejected Resignation (Status = 3)
1. ✅ View resignation with Status = 3 (Rejected)
2. ✅ Verify status badge shows "Rejected" in red/error color

#### Case 4D: Revoked Resignation (Status = 4)
1. ✅ View resignation with Status = 4 (Revoked)
2. ✅ Verify status badge shows "Revoked" in grey color

**Pass Criteria:**
- ✅ Timeline updates correctly based on status
- ✅ Icons change (check vs clock) appropriately
- ✅ Colors match status (green=completed, grey=pending)
- ✅ Status badge shows correct label and color

---

### Scenario 5: Clearance Status Display

**Objective:** Test clearance status cards for accepted resignations

**Steps:**
1. ✅ View resignation with Status = 2 (Accepted)
2. ✅ **Expected:** Clearance Status section is visible
3. ✅ Verify 4 clearance cards display:
   - HR Clearance (ExitInterviewStatus field)
   - Department Clearance (KTStatus field)
   - IT Clearance (ITDues field)
   - Accounts Clearance (AccountNoDue field)
4. ✅ For each completed clearance (value = true):
   - **Expected:** Green check icon
   - **Expected:** "Completed" label in green text
5. ✅ For each pending clearance (value = false/null):
   - **Expected:** Grey clock icon
   - **Expected:** "Pending" label in grey text
6. ✅ View resignation with Status = 1 (Pending)
   - **Expected:** Clearance Status section is NOT visible

**Pass Criteria:**
- ✅ Clearance section only shows for accepted resignations
- ✅ All 4 clearance cards display correctly
- ✅ Icons and colors match clearance status
- ✅ Card layout is responsive (2x2 grid on desktop, stacked on mobile)

---

### Scenario 6: Revoke Resignation Action

**Objective:** Test revoking a pending resignation

**Prerequisites:** Have a pending resignation (Status = 1)

**Steps:**
1. ✅ Navigate to Exit Details tab for pending resignation
2. ✅ Verify "Revoke Resignation" button is visible
3. ✅ Click "Revoke Resignation" button
4. ✅ **Expected:** Browser confirmation dialog appears:
   ```
   Are you sure you want to revoke your resignation? 
   This action cannot be undone.
   ```
5. ✅ Click "Cancel" in confirmation
   - **Expected:** Dialog closes, no action taken
6. ✅ Click "Revoke Resignation" button again
7. ✅ Click "OK" in confirmation
   - **Expected:** Loading state appears
8. ✅ **Expected:** Success snackbar appears (top of screen):
   ```
   Resignation revoked successfully
   ```
9. ✅ **Expected:** Resignation data reloads automatically
10. ✅ Verify status updated to "Revoked" (Status = 4)
11. ✅ Verify status badge shows "Revoked" in grey
12. ✅ Verify "Revoke Resignation" button is no longer visible

**Negative Test:**
1. ✅ View resignation with Status = 2 (Accepted)
   - **Expected:** "Revoke Resignation" button is NOT visible
2. ✅ View resignation with Status = 3 (Rejected)
   - **Expected:** "Revoke Resignation" button is NOT visible
3. ✅ View resignation with Status = 4 (Revoked)
   - **Expected:** "Revoke Resignation" button is NOT visible

**Pass Criteria:**
- ✅ Revoke button only visible for pending resignations
- ✅ Confirmation dialog prevents accidental revocation
- ✅ API call succeeds
- ✅ Success snackbar shows
- ✅ Data reloads automatically
- ✅ Status updates correctly

---

### Scenario 7: Request Early Release

**Objective:** Test early release request for accepted resignations

**Prerequisites:** Have an accepted resignation (Status = 2) WITHOUT existing early release request

**Steps:**
1. ✅ Navigate to Exit Details tab for accepted resignation
2. ✅ Verify "Request Early Release" button is visible (orange color)
3. ✅ Click "Request Early Release" button
4. ✅ **Expected:** Dialog opens with:
   - Title: "Request Early Release"
   - Icon
   - Description text
   - Date picker field
   - "Cancel" and "Submit Request" buttons
5. ✅ Try submitting without selecting date
   - **Expected:** "Submit Request" button is disabled
6. ✅ Select a date in the date picker
   - **Expected:** "Submit Request" button becomes enabled
7. ✅ Click "Submit Request" button
   - **Expected:** Button shows loading state
8. ✅ **Expected:** Success snackbar appears:
   ```
   Early release request submitted successfully
   ```
9. ✅ **Expected:** Dialog closes automatically
10. ✅ **Expected:** Resignation data reloads
11. ✅ Verify Early Release Date now displays in Resignation Information
12. ✅ Verify "Request Early Release" button is no longer visible

**Negative Test:**
1. ✅ View resignation with Status = 1 (Pending)
   - **Expected:** "Request Early Release" button is NOT visible
2. ✅ View accepted resignation that already has early release date
   - **Expected:** "Request Early Release" button is NOT visible
3. ✅ In dialog, click "Cancel" button
   - **Expected:** Dialog closes, no action taken

**Pass Criteria:**
- ✅ Button only visible for accepted resignations without early release
- ✅ Dialog displays correctly with date picker
- ✅ Form validation works (button disabled without date)
- ✅ API call succeeds
- ✅ Success snackbar shows
- ✅ Dialog closes after success
- ✅ Data reloads with early release date
- ✅ Button becomes hidden after request

---

### Scenario 8: View Full Details Navigation

**Objective:** Test navigation to full resignation details page

**Steps:**
1. ✅ Navigate to Exit Details tab
2. ✅ Verify "View Full Details" button is visible (primary color, eye icon)
3. ✅ Click "View Full Details" button
4. ✅ **Expected:** Navigate to `/resignation/details/:id` (where :id is ResignationId)
5. ✅ **Expected:** ResignationDetailsPage.vue loads
6. ✅ Verify comprehensive details page shows:
   - All resignation information
   - Full timeline
   - Clearance details
   - Actions section
   - More detailed information than tab view

**Pass Criteria:**
- ✅ Button visible and clickable
- ✅ Navigation works with correct resignation ID
- ✅ Full details page loads successfully
- ✅ All information displays correctly

---

### Scenario 9: Responsive Design Testing

**Objective:** Test UI responsiveness on different screen sizes

**Test Devices/Viewports:**
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Steps:**
1. ✅ Test resignation form on each viewport:
   - Form fields stack properly
   - Buttons are accessible
   - Text is readable
   - No horizontal scroll
2. ✅ Test Exit Details tab on each viewport:
   - Timeline displays correctly
   - Information cards adapt to screen
   - Clearance cards reflow (4 → 2 → 1 columns)
   - Action buttons stack on mobile
3. ✅ Test dialogs on each viewport:
   - Dialogs fit screen
   - Content is readable
   - Buttons accessible
   - No overflow issues

**Pass Criteria:**
- ✅ All components responsive
- ✅ No layout breaking on small screens
- ✅ Touch targets are adequate (44px minimum)
- ✅ Text remains readable

---

### Scenario 10: Error Handling

**Objective:** Test error scenarios and messages

**Test Cases:**

#### Case 10A: API Errors
1. ✅ Stop backend server
2. ✅ Try to submit resignation
   - **Expected:** Error snackbar appears with network error message
3. ✅ Try to load Exit Details
   - **Expected:** Error alert displays in Exit Details tab
4. ✅ Try to revoke resignation
   - **Expected:** Error snackbar appears

#### Case 10B: Invalid Data
1. ✅ Try to access `/resignation/details/99999` (non-existent ID)
   - **Expected:** Error message displays
2. ✅ Submit form with exactly 501 characters in reason
   - **Expected:** Validation error appears

#### Case 10C: Permission Errors
1. ✅ Try to access another employee's resignation details
   - **Expected:** 403 Forbidden or redirect to own profile

**Pass Criteria:**
- ✅ All errors handled gracefully
- ✅ User-friendly error messages displayed
- ✅ No console errors or crashes
- ✅ Application remains usable after errors

---

## Regression Testing

### After Code Changes, Verify:

1. ✅ Employee exit list page still shows department/branch correctly
2. ✅ Admin exit management features still work
3. ✅ Other profile menu items still function
4. ✅ Authentication still works
5. ✅ No existing features broken

## Performance Testing

### Check:
1. ✅ Page load times acceptable (< 2 seconds)
2. ✅ API calls complete reasonably (< 1 second)
3. ✅ No memory leaks with repeated navigation
4. ✅ Smooth animations and transitions

## Accessibility Testing

### Verify:
1. ✅ Keyboard navigation works throughout
2. ✅ Focus indicators visible
3. ✅ Color contrast meets WCAG AA standards
4. ✅ Screen reader compatibility (if applicable)

## Browser Compatibility

### Test On:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest, if Mac available)

## Test Data Setup

### Create Test Employees:

#### Employee 1: No Resignation
- Used for Scenario 1 (first-time submission)

#### Employee 2: Pending Resignation
- Status = 1
- Used for Scenario 6 (revoke resignation)

#### Employee 3: Accepted Resignation
- Status = 2
- No early release date
- Some clearances completed, some pending
- Used for Scenarios 2, 5, 7

#### Employee 4: Revoked Resignation
- Status = 4
- Used for status display testing

## Reporting Results

### For Each Scenario:
- ✅ Pass
- ❌ Fail (with details)
- ⚠️ Partial (with notes)

### Create Bug Reports for Failures:
- Title
- Scenario number
- Steps to reproduce
- Expected result
- Actual result
- Screenshots (if applicable)
- Browser/device info

## Sign-Off Checklist

Before marking feature as complete:

- [ ] All 10 test scenarios pass
- [ ] No critical bugs
- [ ] Responsive design verified
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Accessibility checked
- [ ] Browser compatibility confirmed
- [ ] Regression tests pass
- [ ] Documentation complete
- [ ] Code reviewed

## Notes

- Test with realistic data (varied resignation reasons, dates, etc.)
- Test edge cases (long names, special characters, etc.)
- Verify database persistence after page refresh
- Check browser console for errors during testing
- Verify API responses match expected format
- Test concurrent user scenarios if applicable

---

**Testing Duration Estimate:** 2-3 hours for complete test suite
**Priority:** P0 (Critical - User-facing feature)
**Environment:** Development → Staging → Production
