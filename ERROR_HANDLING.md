# Resilient Error Handling Strategy — AIESEC Egypt CRM

This document outlines the 5-layer error handling architecture implemented to ensure a professional, student-friendly, and resilient experience.

---

## The 5 Layers of Resilience

### 1. API & Network Layer (`src/utils/errorHandler.js`)
All HTTP responses are intercepted. Technical codes are mapped to human-friendly messages:
- **401/403**: "Session expired" or "Permission denied" with clear next steps.
- **404**: Branded "Not Found" messaging.
- **500/Network**: Calm, non-alarmist messages suggesting connection checks or retries.

### 2. Form & Validation Layer
Inline validation is standardized across `LeadForm.js` and `Auth` pages:
- Immediate feedback using AIESEC Blue/Orange cues.
- Helper text that provides examples (e.g., "name@aiesec.net").
- Top-level summaries if multiple errors exist.

### 3. Visual Feedback (Global Snackbar)
Fragmented local notification states have been replaced with a **Global Snackbar Context**:
- **Usage**: `const { showSuccess, showError, showWarning, showInfo } = useSnackbarContext();`
- **Benefits**: Consistent positioning (bottom-center), branded styling, and reduced boilerplate code in page components.

### 4. Actionable Empty States (`EmptyState.js`)
Data-heavy tables (Leads, Realizations, Visits) now feature informative empty states:
- Professional illustrations for "No Data Found".
- **Actionable Retries**: Primary buttons to "Refresh API" or "Retry Search" to encourage user-driven recovery.

### 5. Global Error Boundary (`src/app/ErrorBoundary.js`)
The ultimate safety net for runtime crashes:
- Catch-all for unexpected UI failures.
- **Branded Fallback**: A full-page experience with AIESEC colors (#F85A40 for errors).
- **User Actions**: Simple "Reload Page" or "Go Home" buttons to restore the application state.

---

## Key Components

### `useSnackbarContext`
Centralized notification hook. Recommended for all user feedback.

### `EmptyState`
Use when a table or list returns 0 results or an initial fetch fails.
```javascript
<EmptyState 
  title="No Leads Found" 
  description="Try adjusting your filters or refreshing the sync." 
  onAction={fetchData} 
  actionLabel="Refresh Data"
/>
```

### `ErrorBoundary`
Wraps the root `<App />`. Automatically captures and logs critical UI crashes.
