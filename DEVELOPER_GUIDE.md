# Developer Quick Reference

Quick reference for common development tasks in the AIESEC CRM project.

## 📁 File Locations

### Core Files
| What | Where |
|------|-------|
| Main App | `src/App.js` |
| Routes | `src/routes/router.js` |
| LC Codes | `src/lcCodes.js` |
| Theme | `src/theme/appTheme.js` |

### Pages
| Page | Location |
|------|----------|
| Leads | `src/pages/leads/LeadsPage.js` |
| OGX Realizations | `src/pages/leads/OGXRealizationsPage.js` |
| ICX Realizations | `src/pages/ICXRealizationsPage.js` |
| Dashboard | `src/components/Dashboard/Dashboard.js` |
| Login | `src/pages/LoginPage.js` |

### Contexts
| Context | Location | Purpose |
|---------|----------|---------|
| Auth | `src/context/AuthContext.js` | User login, admin status |
| TeamMembers | `src/context/TeamMembersContext.js` | Cached team members |
| CRMType | `src/context/CRMTypeContext.js` | OGX/ICX/Leads mode |

### Environment variables
See `.env.example` for optional vars. Example:
- **REACT_APP_FASTAPI_BASE** – FastAPI backend base URL (Calendar, scheduled visits, Google Calendar). Default: `http://localhost:8000/api/v1`.

---

## 🎣 Hooks Quick Reference

### General Hooks
```javascript
import { useOfficeId, useTableSort, useSnackbar } from '../hooks';

// Get office ID
const officeId = useOfficeId();

// Table sorting
const { order, orderBy, handleSort, sortedData } = useTableSort(data, 'name');

// Notifications
const { snackbar, showSuccess, showError, closeSnackbar } = useSnackbar();
showSuccess('Lead saved!');
showError('Failed to save');
```

### Lead Hooks
```javascript
import { useLeadsCursorFetch, useLeadStatuses } from '../hooks';

// Paginated leads
const { leads, loading, refresh, loadMore, hasMore } = useLeadsCursorFetch({ homeLcId });

// Lead statuses
const { statusById } = useLeadStatuses(leadIds);
```

### Team Members (Context)
```javascript
import { useTeamMembersContext } from '../context/TeamMembersContext';

const { members, fetchMembers, hasFetched, clearMembers } = useTeamMembersContext();

// Fetch if needed
useEffect(() => {
  if (!hasFetched && currentUser) {
    fetchMembers(currentUser, isAdmin);
  }
}, [hasFetched, currentUser, isAdmin, fetchMembers]);
```

---

## 🛠 Utility Functions

### Office/LC Utilities
```javascript
import { getOfficeId, getMCCode, normalizeOfficeName } from '../utils/officeUtils';

const officeId = getOfficeId(currentUser);
const mcCode = getMCCode(isAdmin, currentUser);
```

### Sorting
```javascript
import { sortData, safeCompare, numericCompare } from '../utils/sortUtils';

const sorted = sortData(leads, 'fullName', 'asc');
```

### LC Code Lookup
```javascript
import { LC_CODES } from '../lcCodes';

// Find LC by ID
const lc = LC_CODES.find(lc => lc.id === homeLocId);
const lcName = lc?.name || 'Unknown';

// Find LC by name
const lc = LC_CODES.find(lc => lc.name === 'Alexandria');
const lcId = lc?.id;
```

---

## 📝 Common Patterns

### Adding a New Filter
```javascript
// 1. Add state
const [myFilter, setMyFilter] = useState('');

// 2. Add to filter logic
const filteredData = data.filter(item => {
  // ...existing filters
  const matchesMyFilter = !myFilter || item.field === myFilter;
  return /* other conditions && */ matchesMyFilter;
});

// 3. Pass to View component
<MyView
  myFilter={myFilter}
  setMyFilter={setMyFilter}
  // ...
/>
```

### Adding a New API Call
```javascript
// 1. Add to service file (e.g., src/api/services/realizationsService.js)
export async function myNewEndpoint(param) {
  const response = await apiClient.get(`/api/endpoint/${param}`);
  return response.data;
}

// 2. Use in component
import { myNewEndpoint } from '../../api/services/realizationsService';

const fetchData = async () => {
  try {
    setLoading(true);
    const data = await myNewEndpoint(id);
    setData(data);
  } catch (err) {
    console.error('Error:', err);
    setSnackbar({ open: true, message: 'Failed', severity: 'error' });
  } finally {
    setLoading(false);
  }
};
```

### Adding a New Page
```javascript
// 1. Create page component: src/pages/MyNewPage.js
export default function MyNewPage() {
  return <div>My Page</div>;
}

// 2. Add route in src/routes/router.js
import MyNewPage from '../pages/MyNewPage';

{
  path: '/my-page',
  element: <MyNewPage />,
}

// 3. Add to navigation in src/components/Layout/navigationConfig.js
{
  label: 'My Page',
  path: '/my-page',
  icon: <MyIcon />,
}
```

---

## 🔧 Debugging Tips

### Console Log Prefixes
- `🔍 [Component]` - Debug info
- `⚠️` - Warning
- `❌` - Error

### Check Local Storage
```javascript
// In browser console:
localStorage.getItem('team_members')
localStorage.getItem('prepState')
localStorage.getItem('userLC')
```

### Check Cookies
```javascript
import Cookies from 'js-cookie';
Cookies.get('expa_access_token')
Cookies.get('person_id')
```

---

## 📋 Code Style

### Section Comments
```javascript
// ===========================================================================
// SECTION NAME
// ===========================================================================
```

### Sub-Section Comments
```javascript
// ---------------------------------------------------------------------------
// Sub-section name
// ---------------------------------------------------------------------------
```

### JSDoc for Functions
```javascript
/**
 * Brief description
 * 
 * @param {Type} paramName - Description
 * @returns {Type} Description
 */
function myFunction(paramName) {
  // ...
}
```
