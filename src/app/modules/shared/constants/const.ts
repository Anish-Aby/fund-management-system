export const APP_NAME = 'FinLab';

export const ROUTER_PATHS = {
  DASHBOARD: 'app/dashboard',
  LOGIN: 'app/login',
};

export const LOGIN_TEXT_EXIT_DURATION = 460;
export const LOGIN_PANEL_VISIBLE_DURATION = 4000;

export const API_URLS = {
  LOGIN: 'api/v1/auth/login',
  LOGOUT: 'api/v1/auth/logout',
  VERIFY_OTP: 'api/v1/auth/verify-otp',
  FORGOT_PASSWORD: 'api/v1/auth/forgot-password',
  RESET_PASSWORD: 'api/v1/auth/reset-password',
  BANK_LIST_DATA: 'api/V1/Bank',
  COUNTRY_LOOKUP: 'api/common/countries',
  CURRENCY_LOOKUP: 'api/common/currencies',
  FUND_REGION_LOOKUP: 'api/common/fund-regions',
  BANK_ADD: 'api/v1/bank/add-update',
  REFRESH_TOKEN: 'api/v1/auth/refresh-token',
  ENTITY_LIST_DATA: 'api/v1/Entity',
  ENTITY_ADD: 'api/v1/Entity/add-update',
  TAX_TYPE_LOOKUP: 'api/v1/Entity/taxTypes',
  ENTITY_LOOKUP: 'api/Common/entities',
  PORTFOLIO_LIST_DATA: 'api/v1/Funds',
  PORTFOLIO_ADD: 'api/v1/Funds/add-update',
};

export const VALIDATOR_REGEX_PATTERNS = {
  PHONE_PATTERN: /^\d{10}$/,
  SWIFT_PATTERN: /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i,
  ACH_PATTERN: /^\d{9}$/,
  ROUTING_PATTERN: /^\d{9}$/,
  ZIP_PATTERN: /^[A-Z0-9\s\-]{4,10}$/i,
};

export const DIALOG_COMPONENT_TITLES = {
  MASTERS: {
    USER_MANAGEMENT: 'User Management',
    ROLES_MANAGEMENT: 'Roles Management',
    ENTITY_MANAGEMENT: 'Entity Management',
    VENDOR_MANAGEMENT: 'Vendor Management',
    EXPENSE_MANAGEMENT: 'Expense Management',
    PORTFOLIO_MANAGEMENT: 'Portfolio Management',
    BANK_MANAGEMENT: 'Bank Management',
  },
  REPORTS: {
    LEDGER_REPORT: 'Ledger Report',
    EXPENSES_REPORT: 'Expenses Report',
    CASH_BALANCE: 'Cash Balance',
    FUND_CASH_BALANCE: 'Fund Cash Balance',
    TAX_REPORT: 'Tax Report',
  },
  TOOLS: {
    FOREX_PRICING: 'Forex Pricing',
  },
  SETTINGS: {
    BACKUP_SCHEDULE: 'Backup Schedule',
    AUDIT_TRAIL: 'Audit Trail',
  },
  FILE: {
    ADD_INVOICE: 'Add Invoice',
    JOURNAL_ENTRY: 'Journal Entry',
    RECONCILIATION: 'Reconciliation',
    IMPORT_FILE: 'Import File',
    EXPORT_FILE: 'Export File',
  },
  OTHERS: {
    INVOICE_REVIEW: 'Invoice Review',
    NOTIFICATIONS: 'Notifications',
    HELP: 'Help',
    INVOICE_LIST_ALL: 'All Invoices',
    INVOICE_LIST_PENDING: 'Pending Invoices',
    INVOICE_LIST_APPROVED: 'Approved Invoices',
    INVOICE_LIST_REJECTED: 'Rejected Invoices',
    INVOICE_LIST_PAID: 'Paid Invoices',
    INVOICE_LIST_SCHEDULED: 'Scheduled for Release Invoices',
    INVOICE_SPLIT: 'Split Invoice',
    EMAIL_DETAILS: 'Email Details',
  },
};

export const ERROR_MESSAGES = {
  UNKOWN_ERROR: 'An unknown error occurred',
  INTERNAL_SERVER_ERROR: 'Internal server error occurred',
  UNAUTHORIZED: 'You are unauthorized to access this resource',
};

export const TOAST_MESSAGES = {
  LOGGED_OUT_SUCCESSFULLY: 'Logged out successfully',
  LOGGED_IN_SUCCESSFULLY: 'Logged in successfully',
  PLEASE_LOG_IN_AGAIN: 'Please go back and login again.',
};

export const SESSION_STORAGE_KEYS = {
  BEARER_TOKEN: 'ZabbBES',
  REFRESH_TOKEN: 'ZabbRES',
};
