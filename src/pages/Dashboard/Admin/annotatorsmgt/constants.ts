// Status enums for better type safety
export enum AnnotatorStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
  SUBMITTED = 'submitted',
  INACTIVE = 'inactive'
}

export enum QAStatus {
  APPROVED = 'approved',
  PENDING = 'pending', 
  REJECTED = 'rejected'
}

// Status colors mapping
export const STATUS_COLORS = {
  [AnnotatorStatus.APPROVED]: 'green',
  [AnnotatorStatus.PENDING]: 'orange',
  [AnnotatorStatus.REJECTED]: 'red',
  [AnnotatorStatus.SUBMITTED]: 'blue',
  [AnnotatorStatus.INACTIVE]: 'gray'
} as const;

export const QA_STATUS_COLORS = {
  [QAStatus.APPROVED]: 'green',
  [QAStatus.PENDING]: 'orange',
  [QAStatus.REJECTED]: 'red'
} as const;

// Filter options
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: AnnotatorStatus.APPROVED, label: 'Approved' },
  { value: AnnotatorStatus.PENDING, label: 'Pending' },
  { value: AnnotatorStatus.REJECTED, label: 'Rejected' },
  { value: AnnotatorStatus.SUBMITTED, label: 'Submitted' }
];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_CURRENT_PAGE = 1;

// Search debounce delay
export const SEARCH_DEBOUNCE_DELAY = 500;

// Notification placement
export const NOTIFICATION_PLACEMENT = 'topRight' as const;