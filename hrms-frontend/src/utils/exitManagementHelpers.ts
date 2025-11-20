/**
 * Exit Management Helper Functions
 * Exact replication of legacy utility functions
 */

/**
 * Resignation Status Constants (exact from legacy)
 */
export const ResignationStatus = {
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  REVOKED: 4,
  COMPLETED: 5,
} as const;

export const ResignationStatusLabels: Record<number, string> = {
  1: 'Pending',
  2: 'Accepted',
  3: 'Rejected',
  4: 'Revoked',
  5: 'Completed',
};

/**
 * Early Release Status Constants
 */
export const EarlyReleaseStatus = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
} as const;

export const EarlyReleaseStatusLabels: Record<number, string> = {
  1: 'Pending',
  2: 'Approved',
  3: 'Rejected',
};

/**
 * Knowledge Transfer Status Constants
 */
export const KTStatus = {
  PENDING: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
} as const;

export const KTStatusLabels: Record<number, string> = {
  1: 'Pending',
  2: 'In Progress',
  3: 'Completed',
};

/**
 * Asset Condition Constants
 */
export const AssetCondition = {
  GOOD: 1,
  FAIR: 2,
  DAMAGED: 3,
  LOST: 4,
} as const;

export const AssetConditionLabels: Record<number, string> = {
  1: 'Good',
  2: 'Fair',
  3: 'Damaged',
  4: 'Lost',
};

/**
 * Notice Period Configuration (in days)
 */
export const NoticePeriods = {
  PROBATION: 15,
  TRAINING: 15,
  CONFIRMED: 60,
} as const;

/**
 * Get resignation status label
 */
export function getResignationStatusLabel(statusId: number | null | undefined): string {
  if (statusId === null || statusId === undefined) return 'Unknown';
  return ResignationStatusLabels[statusId] || 'Unknown';
}

/**
 * Get early release status label
 */
export function getEarlyReleaseStatusLabel(statusId: number | null | undefined): string {
  if (statusId === null || statusId === undefined) return 'N/A';
  return EarlyReleaseStatusLabels[statusId] || 'Unknown';
}

/**
 * Get KT status label
 */
export function getKTStatusLabel(statusId: number | null | undefined): string {
  if (statusId === null || statusId === undefined) return 'N/A';
  return KTStatusLabels[statusId] || 'Unknown';
}

/**
 * Get asset condition label
 */
export function getAssetConditionLabel(conditionId: number | null | undefined): string {
  if (conditionId === null || conditionId === undefined) return 'Unknown';
  return AssetConditionLabels[conditionId] || 'Unknown';
}

/**
 * Calculate last working day based on job type
 * @param resignationDate - Date of resignation submission
 * @param jobTypeId - Employee job type (1=Probation, 2=Training, 3=Confirmed)
 */
export function calculateLastWorkingDay(resignationDate: Date, jobTypeId: number): Date {
  const date = new Date(resignationDate);
  
  let noticeDays: number;
  switch (jobTypeId) {
    case 1: // Probation
      noticeDays = NoticePeriods.PROBATION;
      break;
    case 2: // Training
      noticeDays = NoticePeriods.TRAINING;
      break;
    case 3: // Confirmed
      noticeDays = NoticePeriods.CONFIRMED;
      break;
    default:
      noticeDays = NoticePeriods.CONFIRMED;
  }
  
  date.setDate(date.getDate() + noticeDays);
  return date;
}

/**
 * Validate resignation data before submission
 */
export function validateResignationData(data: {
  EmployeeId?: number;
  DepartmentID?: number;
  Reason?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.EmployeeId) {
    errors.push('Employee ID is required');
  }
  
  if (!data.DepartmentID) {
    errors.push('Department is required');
  }
  
  if (!data.Reason || data.Reason.trim().length === 0) {
    errors.push('Resignation reason is required');
  } else if (data.Reason.length > 500) {
    errors.push('Resignation reason cannot exceed 500 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format clearance status for display
 */
export function formatClearanceStatus(clearance: any | null | undefined): string {
  if (!clearance) return 'Pending';
  return 'Completed';
}

/**
 * Check if all clearances are completed
 */
export function areAllClearancesCompleted(resignation: {
  hrClearance?: any;
  departmentClearance?: any;
  itClearance?: any;
  accountClearance?: any;
}): boolean {
  return !!(
    resignation.hrClearance &&
    resignation.departmentClearance &&
    resignation.itClearance &&
    resignation.accountClearance
  );
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Check if resignation can be revoked
 */
export function canRevokeResignation(status: number | null | undefined): boolean {
  if (status === null || status === undefined) return false;
  return status === ResignationStatus.PENDING || status === ResignationStatus.ACCEPTED;
}

/**
 * Check if early release can be requested
 */
export function canRequestEarlyRelease(status: number | null | undefined): boolean {
  if (status === null || status === undefined) return false;
  return status === ResignationStatus.ACCEPTED;
}

/**
 * Get status badge color (for UI components)
 */
export function getStatusBadgeColor(status: number | null | undefined): string {
  if (status === null || status === undefined) return 'gray';
  
  switch (status) {
    case ResignationStatus.PENDING:
      return 'orange';
    case ResignationStatus.ACCEPTED:
      return 'green';
    case ResignationStatus.REJECTED:
      return 'red';
    case ResignationStatus.REVOKED:
      return 'gray';
    case ResignationStatus.COMPLETED:
      return 'blue';
    default:
      return 'gray';
  }
}
