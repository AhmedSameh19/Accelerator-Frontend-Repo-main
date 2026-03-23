# AIESEC Accelerator CRM Frontend

A React-based Customer Relationship Management (CRM) system for AIESEC Egypt, designed to manage leads, track exchange program realizations, and facilitate team coordination.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Concepts](#key-concepts)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Common Patterns](#common-patterns)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Utilities & Hooks](#utilities--hooks)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

This application serves as the main CRM for managing:

1. **Leads** - Potential exchange participants (EPs) from the lead generation pipeline
2. **OGX Realizations** - Outgoing exchange participants who are in the realization process
3. **ICX Realizations** - Incoming exchange participants
4. **Market Research** - Data collection and analysis
5. **Team Member Management** - Assignment and coordination

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **Material-UI (MUI)** | Component Library |
| **React Router** | Client-side Routing |
| **Context API** | State Management |
| **Axios** | HTTP Client |
| **js-cookie** | Cookie Management |
| **date-fns** | Date Utilities |

---

## Project Structure

```
src/
├── api/                    # API service layer
│   └── services/           # API service modules
│       ├── aiesecApi.js    # AIESEC EXPA API integration
│       ├── authService.ts  # Authentication services
│       ├── leadsApi.js     # Leads API endpoints
│       ├── membersAPI.js   # Team members API
│       └── realizationsService.js  # OGX realizations API
│
├── app/                    # App-level components
│   ├── ErrorBoundary.js    # Global error boundary
│   └── NotificationInitializer.js
│
├── components/             # Shared components
│   ├── Dashboard/          # Dashboard widgets
│   ├── Layout/             # Main layout components
│   │   ├── DrawerContent.js
│   │   ├── MainLayout.js
│   │   └── navigationConfig.js
│   ├── Leads/              # Lead-related components
│   │   ├── LeadForm/       # Lead form components
│   │   ├── LeadProfile/    # Profile view components
│   │   └── LeadTable/      # Table components
│   └── Notifications/      # Notification components
│
├── constants/              # Application constants
│   ├── leadProfileOptions.js    # Form options
│   └── ogxRealizationsConstants.js  # OGX constants & helpers
│
├── context/                # React Context providers
│   ├── AuthContext.js      # Authentication state
│   ├── CRMTypeContext.js   # CRM type (OGX/ICX/etc)
│   ├── NotificationsContext.js
│   └── TeamMembersContext.js   # Cached team members
│
├── hooks/                  # Custom React hooks
│   ├── index.js            # Barrel export
│   ├── useOfficeId.js      # Office ID resolution
│   ├── useTableSort.js     # Table sorting state
│   ├── useSnackbar.js      # Snackbar notifications
│   ├── leads/              # Lead-specific hooks
│   │   ├── useLeadsCursorFetch.js  # Paginated lead fetching
│   │   ├── useLeadStatuses.js      # Lead status tracking
│   │   └── useTeamMembers.js       # Team member fetching
│   └── ogx/                # OGX-specific hooks
│       ├── index.js        # Barrel export
│       ├── useBulkAssignment.js
│       ├── useLeadSelection.js
│       ├── useOGXFilters.js
│       └── useOGXRealizations.js
│
├── pages/                  # Page components
│   ├── leads/              # Leads module
│   │   ├── LeadsPage.js    # Main leads page
│   │   ├── LeadProfile.js  # Lead detail page
│   │   ├── OGXRealizationsPage.js  # OGX realizations
│   │   ├── components/     # Page-specific components
│   │   └── ogx/            # OGX sub-components
│   └── reports/            # Reports module
│
├── routes/                 # Routing configuration
│   ├── router.js           # Main router setup
│   └── routeGuards.js      # Auth route guards
│
├── theme/                  # MUI theme configuration
│   └── appTheme.js
│
├── utils/                  # Utility functions
│   ├── index.js            # Barrel export
│   ├── officeUtils.js      # Office/LC utilities
│   ├── sortUtils.js        # Sorting utilities
│   ├── printUtils.js       # Print utilities
│   ├── authStatus.js       # Token validation
│   └── leads/              # Lead-specific utilities
│       └── filterLeads.js
│
├── lcCodes.js              # LC/MC code mappings
├── App.js                  # Root component
└── index.js                # Entry point
```

---

## Key Concepts

### LC Codes (Local Committees)

The `lcCodes.js` file contains mappings between LC names and their EXPA IDs:

```javascript
export const LC_CODES = [
  { id: 2164, name: 'Alexandria' },
  { id: 2166, name: 'Cairo University' },
  // ... more LCs
];

export const MC_EGYPT_CODE = 1574;  // National level code
```

### Exchange Types

- **GV** (Global Volunteer) - Volunteer exchanges
- **GTe** (Global Teacher) - Teaching exchanges
- **GTa** (Global Talent) - Professional internships

### Lead Statuses

Leads progress through various statuses:
- `New Lead` → `Contacted` → `Interested` → `Applied` → `Accepted` → `Realized`

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file with:

```env
REACT_APP_API_URL=your_api_url
REACT_APP_EXPA_API_URL=https://gis-api.aiesec.org
```

---

## Architecture

### Component Pattern

We follow a **Container/Presenter pattern**:

- **Container Components** (Pages) - Handle data fetching, state, business logic
- **Presenter Components** (Views) - Pure UI rendering

Example:
```
OGXRealizationsPage.js  → Container (state, handlers)
OGXRealizationsView.js  → Presenter (UI only)
```

### State Management

1. **Local State** - `useState` for component-specific state
2. **Context** - For shared state across components
   - `AuthContext` - User authentication
   - `TeamMembersContext` - Cached team members
   - `CRMTypeContext` - Current CRM type
3. **localStorage** - For persistent data
   - `team_members` - Cached members (24h expiry)
   - `prepState` - Preparation steps state

---

## Common Patterns

### Fetching Data

```javascript
// Use the cursor-based pagination hook for leads
const { leads, loading, refresh, loadMore, hasMore } = useLeadsCursorFetch({ homeLcId });

// Use TeamMembersContext for cached team members
const { members, fetchMembers, hasFetched } = useTeamMembersContext();
```

### Getting LC/Office ID

```javascript
import { getOfficeId, getMCCode } from '../utils/officeUtils';

// Get current user's office ID
const officeId = getOfficeId(currentUser);

// Get MC code for admin operations
const mcCode = getMCCode(isAdmin, currentUser);
```

### Filtering Leads

```javascript
import { filterLeads } from '../utils/leads/filterLeads';

const filteredLeads = filterLeads({
  leads,
  searchTerm,
  statusFilter,
  dateRange,
  // ... more filters
});
```

### Sorting Data

```javascript
import { sortData } from '../utils/sortUtils';

const sortedLeads = sortData(leads, 'fullName', 'asc');
```

---

## API Integration

### Base URLs

```javascript
// Local API (backend)
const baseUrl = process.env.REACT_APP_API_URL || 'https://your-api.com';

// AIESEC EXPA API
const expaUrl = 'https://gis-api.aiesec.org';
```

### Common Endpoints

| Service | Endpoint | Description |
|---------|----------|-------------|
| Leads | `GET /api/leads` | Get leads by LC |
| Realizations | `GET /api/ogx/realizations` | Get OGX realizations |
| Members | `GET /api/members` | Get team members |
| Assign | `POST /api/ogx/bulk-assign` | Bulk assign leads |

### Authentication

Authentication uses AIESEC SSO with token storage:

```javascript
// Tokens stored in cookies
const accessToken = Cookies.get('expa_access_token');
const refreshToken = Cookies.get('expa_refresh_token');
```

---

## Utilities & Hooks

### Available Hooks

| Hook | Purpose |
|------|---------|
| `useOfficeId()` | Resolve current user's office ID |
| `useTableSort()` | Manage table sorting state |
| `useSnackbar()` | Manage notification state |
| `useLeadsCursorFetch()` | Paginated lead fetching |
| `useLeadStatuses()` | Track lead status updates |
| `useTeamMembersContext()` | Access cached team members |

### Import Pattern

```javascript
// Import from barrel files for cleaner imports
import { useOfficeId, useTableSort, useSnackbar } from '../hooks';
import { getOfficeId, sortData, printSelectedLeads } from '../utils';
```

---

## Troubleshooting

### Common Issues

1. **"Could not determine office/LC ID"**
   - Check that user has `current_offices` in their profile
   - Verify `userLC` is set in localStorage or cookies
   - Ensure LC name matches exactly with `LC_CODES`

2. **Team members not loading**
   - Check TeamMembersContext is properly wrapped in App.js
   - Verify localStorage `team_members` is not corrupted
   - Clear cache and re-login

3. **CORS errors**
   - Check setupProxy.js configuration
   - Verify API URL in environment variables

4. **Blank white page after deploy**
   - In browser DevTools → Network, confirm `/static/js/*.js` loads (200) and has `Content-Type: application/javascript`.
   - If the app is served under a path prefix (e.g. `https://domain.com/accelerator`), rebuild with that prefix:
     - Option A: set `"homepage": "/accelerator"` in `package.json`, then run `npm run build`.
     - Option B: run `PUBLIC_URL=/accelerator npm run build`.
   - Ensure your reverse proxy routes the prefix (and its `/static/*`) to this container.

### Debug Logging

The app includes extensive console logging:
```javascript
// Look for these prefixes in console:
🔍 [LeadsPage]     - Lead page debugging
🔍 [TeamMembers]   - Team member context
⚠️ Warning         - Non-critical issues
```

---

## Contributing

When adding new features:

1. **Create utility functions** in `src/utils/`
2. **Create custom hooks** in `src/hooks/` for reusable logic
3. **Document with JSDoc comments**
4. **Use section comments** for code organization:

```javascript
// ===========================================================================
// SECTION NAME
// ===========================================================================

/**
 * Function description
 * @param {Type} param - Description
 * @returns {Type} Description
 */
function myFunction(param) {
  // ...
}
```

---

## Maintainers

For questions or issues, contact the AIESEC Egypt IT team.
