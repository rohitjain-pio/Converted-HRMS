# Exit Management Part 2 - UI Migration Guide
## Resignation Form & Approval Workflow Interface

## 1. Module Overview

Exit Management Part 2 handles the resignation submission process, approval workflows, and notice period management. This module provides both employee self-service resignation submission and administrative approval routing with comprehensive workflow tracking.

### Key UI/UX Scenarios:
- Employee resignation form submission with validation
- Multi-level approval workflow interface
- Notice period calculation and calendar integration
- Document attachment and digital signature collection
- Approval routing and notification management
- Withdrawal and cancellation request handling

### UI Design Principles:
- Step-by-step workflow guidance with clear progression indicators
- Document-centric design with attachment management
- Timeline visualization for approval processes
- Mobile-friendly form interface for employee self-service

## 2. UI Component Inventory

### Form Components:
- **ResignationForm** - Multi-section resignation submission interface
- **ApprovalWorkflow** - Hierarchical approval routing display
- **NoticeCalculator** - Interactive notice period and working day calculator
- **DocumentUpload** - File attachment with validation and preview
- **DigitalSignature** - Electronic signature capture interface

### Workflow Components:
- **ApprovalChain** - Step-by-step approval progression visualization
- **StatusTimeline** - Historical action and decision tracking
- **NotificationCenter** - Real-time approval updates and reminders
- **WithdrawalRequest** - Resignation cancellation workflow

### Calendar Components:
- **NoticePeriodCalendar** - Working day calculation with holiday integration
- **LastWorkingDayPicker** - Business day selection with constraints
- **WorkingDaysCounter** - Real-time notice period validation

## 3. Component Structure & Hierarchy

```
ResignationSubmission
├── ResignationForm (Main Container)
│   ├── EmployeeInformation (Read-only)
│   │   ├── EmployeeName
│   │   ├── EmployeeCode
│   │   ├── Department
│   │   └── CurrentPosition
│   ├── ResignationDetails (Form Section)
│   │   ├── ResignationDate (DatePicker)
│   │   ├── LastWorkingDate (Calculated/Manual)
│   │   ├── ReasonForResignation (Dropdown + Text)
│   │   ├── NoticePeriodCalculator
│   │   │   ├── CompanyPolicy (Display)
│   │   │   ├── WorkingDaysCalculation
│   │   │   └── HolidayAdjustments
│   │   └── AdditionalComments (Textarea)
│   ├── DocumentAttachments
│   │   ├── FileUploadZone
│   │   ├── AttachmentPreview
│   │   └── DocumentValidation
│   ├── DeclarationSection
│   │   ├── TermsAndConditions
│   │   ├── HandoverCommitment
│   │   └── DigitalSignatureCapture
│   └── FormActions
│       ├── SaveAsDraft
│       ├── SubmitForApproval
│       └── Cancel/Reset

ApprovalWorkflowDisplay
├── ApprovalChainVisualization
│   ├── ApprovalStepCards
│   │   ├── ApproverInformation
│   │   ├── ApprovalStatus
│   │   ├── ActionDate
│   │   └── Comments/Feedback
│   ├── CurrentStepIndicator
│   └── NextActionRequired
├── WorkflowTimeline
│   ├── SubmissionEvent
│   ├── ApprovalEvents
│   ├── RejectionEvents (if any)
│   └── CompletionEvent
└── WorkflowActions (Context-based)
    ├── ApprovalActions (if approver)
    ├── WithdrawalRequest (if employee)
    └── StatusInquiry
```

### Key Data Types:
```typescript
interface ResignationForm {
  employeeId: number;
  resignationDate: Date;
  lastWorkingDate: Date;
  reasonCategory: ResignationReason;
  reasonDetails: string;
  additionalComments?: string;
  attachments: FileAttachment[];
  digitalSignature?: string;
  handoverCommitment: boolean;
  termsAcceptance: boolean;
}

interface ApprovalWorkflow {
  id: number;
  resignationId: number;
  currentStep: number;
  totalSteps: number;
  approvalChain: ApprovalStep[];
  status: WorkflowStatus;
  submissionDate: Date;
  completionDate?: Date;
}

interface ApprovalStep {
  stepNumber: number;
  approverId: number;
  approverName: string;
  approverTitle: string;
  status: ApprovalStatus;
  actionDate?: Date;
  comments?: string;
  requiredByDate: Date;
}

enum ApprovalStatus {
  Pending = 'pending',
  Approved = 'approved', 
  Rejected = 'rejected',
  Delegated = 'delegated',
  Skipped = 'skipped'
}
```

## 4. Visual & UX Design Details

### Resignation Form Layout:
```css
Form Container:
- Multi-section card layout with clear visual separation
- Progressive disclosure for complex sections
- Sticky form actions for easy access
- Responsive design with mobile-first approach

Section Styling:
- Header: 1.25rem, weight: 600, color: #212121
- Background: #ffffff with subtle border
- Padding: 24px (desktop), 16px (mobile)
- Elevation: 2px shadow for card separation

Notice Period Calculator:
- Prominent display of calculated dates
- Color-coded validation (green=valid, red=invalid)
- Interactive calendar with business day highlighting
- Real-time updates as dates change
```

### Approval Workflow Visualization:
```css
Approval Chain Styling:
- Horizontal stepper on desktop, vertical on mobile
- Color-coded status indicators
- Profile photos for approvers
- Timeline with connecting lines

Status Colors:
- Pending: #ff9800 (Orange)
- Approved: #4caf50 (Green)
- Rejected: #f44336 (Red)
- Current Step: #2196f3 (Blue)
- Completed: #4caf50 (Green)

Step Indicators:
- Circle: 40px diameter
- Icon: 24px, centered
- Connection Line: 2px solid, color-coded
```

### Document Upload Interface:
```css
Upload Zone:
- Drag-and-drop area with visual feedback
- Border: 2px dashed #ccc, changes to solid on drag
- Background: #f9f9f9 with upload icon
- Minimum height: 120px

File Preview:
- Thumbnail + filename + size
- Remove button overlay on hover
- Progress indicator during upload
- Validation status icons
```

## 5. Interaction Patterns & Accessibility

### Form Validation Flow:
```typescript
// Real-time validation with business rules
const validateNoticePeriod = (resignationDate: Date, lastWorkingDate: Date) => {
  const noticeDays = calculateBusinessDays(resignationDate, lastWorkingDate);
  const requiredNotice = getRequiredNoticePeriod(employee.level);
  
  return {
    isValid: noticeDays >= requiredNotice,
    message: noticeDays < requiredNotice 
      ? `Minimum ${requiredNotice} working days notice required`
      : `Notice period: ${noticeDays} working days`
  };
};

// Form submission with confirmation
const handleSubmitResignation = async (formData: ResignationForm) => {
  const confirmationDialog = await showConfirmation({
    title: 'Submit Resignation',
    message: 'Once submitted, this resignation will be sent for approval. Continue?',
    confirmText: 'Submit',
    cancelText: 'Review Again'
  });
  
  if (confirmationDialog.confirmed) {
    await submitResignation(formData);
    navigateToApprovalTracking();
  }
};
```

### Approval Workflow Interactions:
```typescript
// Approver actions with comments
const handleApprovalAction = async (action: ApprovalAction, comments?: string) => {
  const actionData = {
    resignationId,
    stepId: currentStep.id,
    action,
    comments,
    actionDate: new Date()
  };
  
  await processApprovalAction(actionData);
  refreshWorkflowStatus();
  
  // Send notifications to relevant parties
  await sendWorkflowNotifications(action, currentStep);
};
```

### Accessibility Features:
```html
<!-- Form accessibility -->
<form role="form" aria-label="Resignation Submission Form">
  <fieldset aria-labelledby="resignation-details">
    <legend id="resignation-details">Resignation Details</legend>
    
    <label for="resignation-date">Resignation Date</label>
    <input
      id="resignation-date"
      type="date"
      required
      aria-describedby="resignation-date-help"
    />
    <div id="resignation-date-help">
      Date when you are submitting your resignation
    </div>
  </fieldset>
</form>

<!-- Approval workflow accessibility -->
<ol role="list" aria-label="Approval Workflow Steps">
  <li role="listitem">
    <div role="img" aria-label="Step 1: Completed">
      <ApprovalStepIndicator status="completed" />
    </div>
    <div>
      <h3>Direct Manager Approval</h3>
      <p>Approved on March 15, 2024</p>
    </div>
  </li>
</ol>
```

## 6. Migration Considerations (Vue.js UI Focus)

### Resignation Form Migration:
```vue
<template>
  <v-stepper v-model="currentStep" class="resignation-form">
    <v-stepper-header>
      <v-stepper-item
        v-for="(step, index) in formSteps"
        :key="index"
        :value="index + 1"
        :title="step.title"
        :complete="step.completed"
      />
    </v-stepper-header>
    
    <v-stepper-window>
      <!-- Step 1: Basic Information -->
      <v-stepper-window-item :value="1">
        <v-card-title>Resignation Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-date-picker
                v-model="formData.resignationDate"
                label="Resignation Date"
                :min="today"
                required
                :error-messages="errors.resignationDate"
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <v-date-picker
                v-model="formData.lastWorkingDate"
                label="Last Working Date"
                :min="calculatedMinLastWorkingDate"
                required
                :error-messages="errors.lastWorkingDate"
              />
            </v-col>
          </v-row>
          
          <!-- Notice Period Calculator -->
          <NoticePeriodCalculator
            :resignation-date="formData.resignationDate"
            :last-working-date="formData.lastWorkingDate"
            :employee-level="employee.level"
            @validation-change="handleNoticePeriodValidation"
          />
          
          <v-select
            v-model="formData.reasonCategory"
            :items="resignationReasons"
            label="Reason for Resignation"
            required
            :error-messages="errors.reasonCategory"
          />
          
          <v-textarea
            v-model="formData.reasonDetails"
            label="Detailed Reason"
            rows="3"
            counter="500"
          />
        </v-card-text>
      </v-stepper-window-item>
      
      <!-- Step 2: Document Attachments -->
      <v-stepper-window-item :value="2">
        <v-card-title>Document Attachments</v-card-title>
        <v-card-text>
          <DocumentUploadZone
            v-model="formData.attachments"
            :accept="allowedFileTypes"
            :max-files="5"
            :max-size="10 * 1024 * 1024"
            @upload-error="handleUploadError"
          />
          
          <AttachmentPreview
            :attachments="formData.attachments"
            @remove="removeAttachment"
          />
        </v-card-text>
      </v-stepper-window-item>
      
      <!-- Step 3: Declaration & Signature -->
      <v-stepper-window-item :value="3">
        <v-card-title>Declaration & Digital Signature</v-card-title>
        <v-card-text>
          <v-checkbox
            v-model="formData.termsAcceptance"
            required
          >
            <template #label>
              <div>
                I accept the 
                <a href="/terms-conditions" target="_blank">
                  terms and conditions
                </a>
                for resignation process
              </div>
            </template>
          </v-checkbox>
          
          <v-checkbox
            v-model="formData.handoverCommitment"
            required
          >
            <template #label>
              I commit to complete proper handover of my responsibilities
            </template>
          </v-checkbox>
          
          <DigitalSignaturePad
            v-model="formData.digitalSignature"
            :required="true"
            placeholder="Please provide your digital signature"
          />
        </v-card-text>
      </v-stepper-window-item>
    </v-stepper-window>
    
    <!-- Form Actions -->
    <v-card-actions class="form-actions">
      <v-btn
        v-if="currentStep > 1"
        variant="text"
        @click="currentStep--"
      >
        Previous
      </v-btn>
      
      <v-spacer />
      
      <v-btn
        variant="outlined"
        @click="saveAsDraft"
        :loading="savingDraft"
      >
        Save as Draft
      </v-btn>
      
      <v-btn
        v-if="currentStep < formSteps.length"
        color="primary"
        @click="currentStep++"
        :disabled="!isCurrentStepValid"
      >
        Next
      </v-btn>
      
      <v-btn
        v-else
        color="primary"
        @click="submitResignation"
        :loading="submitting"
        :disabled="!isFormValid"
      >
        Submit Resignation
      </v-btn>
    </v-card-actions>
  </v-stepper>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

// Form validation schema
const validationSchema = yup.object({
  resignationDate: yup.date()
    .required('Resignation date is required')
    .min(new Date(), 'Resignation date cannot be in the past'),
  lastWorkingDate: yup.date()
    .required('Last working date is required')
    .min(yup.ref('resignationDate'), 'Last working date must be after resignation date'),
  reasonCategory: yup.string().required('Please select a reason'),
  termsAcceptance: yup.boolean().oneOf([true], 'You must accept the terms'),
  handoverCommitment: yup.boolean().oneOf([true], 'You must commit to handover'),
  digitalSignature: yup.string().required('Digital signature is required')
});

const { values: formData, errors, validate } = useForm({
  validationSchema,
  initialValues: {
    resignationDate: null,
    lastWorkingDate: null,
    reasonCategory: '',
    reasonDetails: '',
    attachments: [],
    termsAcceptance: false,
    handoverCommitment: false,
    digitalSignature: ''
  }
});

const currentStep = ref(1);
const submitting = ref(false);
const savingDraft = ref(false);

// Calculate minimum last working date based on notice period
const calculatedMinLastWorkingDate = computed(() => {
  if (!formData.resignationDate) return null;
  
  const noticeDays = getRequiredNoticePeriod(employee.level);
  return addBusinessDays(formData.resignationDate, noticeDays);
});

const isCurrentStepValid = computed(() => {
  // Validate current step fields only
  switch (currentStep.value) {
    case 1:
      return formData.resignationDate && formData.lastWorkingDate && formData.reasonCategory;
    case 2:
      return true; // Attachments are optional
    case 3:
      return formData.termsAcceptance && formData.handoverCommitment && formData.digitalSignature;
    default:
      return false;
  }
});

const submitResignation = async () => {
  const { valid } = await validate();
  if (!valid) return;
  
  // Show confirmation dialog
  const confirmed = await confirmSubmission();
  if (!confirmed) return;
  
  try {
    submitting.value = true;
    await resignationService.submitResignation(formData);
    
    // Navigate to approval tracking
    router.push('/exit-management/approval-tracking');
  } catch (error) {
    // Handle error
  } finally {
    submitting.value = false;
  }
};
</script>
```

### Approval Workflow Display:
```vue
<template>
  <div class="approval-workflow">
    <v-card title="Approval Progress">
      <v-card-text>
        <!-- Progress Overview -->
        <div class="workflow-progress">
          <v-progress-linear
            :model-value="progressPercentage"
            color="primary"
            height="6"
            class="mb-4"
          />
          <p class="text-center">
            Step {{ currentStepNumber }} of {{ totalSteps }} 
            ({{ progressPercentage }}% Complete)
          </p>
        </div>
        
        <!-- Approval Chain -->
        <v-stepper
          :model-value="currentStepNumber"
          :items="approvalSteps"
          hide-actions
          class="approval-stepper"
        >
          <template #item.title="{ item }">
            <div class="approval-step-header">
              <v-avatar size="32" class="mr-2">
                <v-img
                  v-if="item.approverPhoto"
                  :src="item.approverPhoto"
                  :alt="item.approverName"
                />
                <span v-else>{{ getInitials(item.approverName) }}</span>
              </v-avatar>
              
              <div class="approver-info">
                <div class="approver-name">{{ item.approverName }}</div>
                <div class="approver-title">{{ item.approverTitle }}</div>
              </div>
              
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                variant="elevated"
              >
                {{ item.status }}
              </v-chip>
            </div>
          </template>
          
          <template #item.subtitle="{ item }">
            <div v-if="item.actionDate" class="approval-details">
              <p class="action-date">
                {{ item.status }} on {{ formatDate(item.actionDate) }}
              </p>
              <p v-if="item.comments" class="approval-comments">
                "{{ item.comments }}"
              </p>
            </div>
            <div v-else-if="item.status === 'pending'" class="pending-details">
              <p class="required-by">
                Action required by {{ formatDate(item.requiredByDate) }}
              </p>
            </div>
          </template>
        </v-stepper>
        
        <!-- Current Approver Actions (if user is current approver) -->
        <div v-if="canApprove" class="approver-actions">
          <v-divider class="my-4" />
          <h4>Your Action Required</h4>
          
          <v-textarea
            v-model="approvalComments"
            label="Comments (optional)"
            rows="3"
            class="my-3"
          />
          
          <div class="action-buttons">
            <v-btn
              color="success"
              @click="handleApproval('approved')"
              :loading="processing"
            >
              <v-icon start>mdi-check</v-icon>
              Approve
            </v-btn>
            
            <v-btn
              color="error"
              @click="handleApproval('rejected')"
              :loading="processing"
            >
              <v-icon start>mdi-close</v-icon>
              Reject
            </v-btn>
            
            <v-btn
              variant="outlined"
              @click="delegateApproval"
            >
              <v-icon start>mdi-account-arrow-right</v-icon>
              Delegate
            </v-btn>
          </div>
        </div>
        
        <!-- Employee Actions (if user is employee) -->
        <div v-else-if="canWithdraw" class="employee-actions">
          <v-divider class="my-4" />
          <v-btn
            variant="outlined"
            color="warning"
            @click="withdrawResignation"
          >
            <v-icon start>mdi-undo</v-icon>
            Withdraw Resignation
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
```

## 7. Visual Reference & Debugging Notes

### Key UI States to Validate:

1. **Form Progression**:
   - Step validation prevents premature advancement
   - Form data persists between steps
   - Error messages display appropriately for each step

2. **Notice Period Calculation**:
   - Business day calculation excludes weekends and holidays
   - Validation feedback updates in real-time
   - Minimum notice period enforced based on employee level

3. **Document Upload**:
   - Drag-and-drop functionality works smoothly
   - File validation prevents invalid uploads
   - Progress indicators show upload status

4. **Approval Workflow**:
   - Status indicators update in real-time
   - Current step highlighted appropriately
   - Action buttons available only to authorized users

### Migration Testing Priorities:

1. **Form Validation**: Business rule enforcement and user feedback
2. **File Upload**: Attachment handling and preview functionality
3. **Approval Flow**: Multi-step workflow progression and status tracking
4. **Mobile Experience**: Touch-friendly form interaction and document upload
5. **Accessibility**: Screen reader navigation and keyboard interaction