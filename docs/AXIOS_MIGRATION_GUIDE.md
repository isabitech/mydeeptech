# Migration Guide: Converting to Hook-based Axios API

This guide shows you how to migrate from the old `window.location.replace` approach to the new React Hook approach that uses `useNavigate`.

## Important: Preventing Page Refreshes on Auth Failures

To prevent page refreshes when authentication fails, you need to set up global navigation in your app root:

### Option 1: Using the provided hook
```tsx
// In your App.tsx or root component
import { useGlobalNavigation } from './hooks/useGlobalNavigation';

function App() {
  useGlobalNavigation(); // Prevents page refreshes on auth failures
  
  return (
    <BrowserRouter>
      {/* Your app components */}
    </BrowserRouter>
  );
}
```

### Option 2: Manual setup
```tsx
// In your App.tsx or root component  
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setGlobalNavigate } from './service/axiosApi';

function App() {
  const navigate = useNavigate();
  
  useEffect(() => {
    setGlobalNavigate(navigate);
  }, [navigate]);
  
  return (
    <BrowserRouter>
      {/* Your app components */}
    </BrowserRouter>
  );
}
```

**Without this setup, auth failures will still work but will cause page refreshes instead of smooth React Router navigation.**

## What Changed?

- ✅ Previously: `window.location.replace()` for redirects (causes full page reload)
- ✅ Now: `useNavigate()` from React Router (single-page app navigation)
- ✅ Better integration with React Router
- ✅ Maintains app state during navigation
- ✅ No full page reloads

## Migration Steps

### Step 1: Update Imports

**Before:**
```tsx
import { multimediaAssessmentApi } from '../service/axiosApi';
```

**After (Option A - Direct hook usage):**
```tsx
import { useAxiosApi, createMultimediaAssessmentApi } from '../service/axiosApi';
```

**After (Option B - Custom hook pattern):**
```tsx
import { useAxiosApi, createMultimediaAssessmentApi } from '../service/axiosApi';

// Create a custom hook for cleaner usage
const useMultimediaApi = () => {
  const { axiosInstance } = useAxiosApi();
  return createMultimediaAssessmentApi(axiosInstance);
};
```

### Step 2: Update Component Logic

**Before:**
```tsx
const MyComponent = () => {
  const fetchData = async () => {
    try {
      const result = await multimediaAssessmentApi.getAvailableAssessments();
      // Handle success
    } catch (error) {
      // Handle error - redirects use window.location.replace
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
};
```

**After (Option A):**
```tsx
const MyComponent = () => {
  const { axiosInstance } = useAxiosApi();
  const api = createMultimediaAssessmentApi(axiosInstance);

  const fetchData = async () => {
    try {
      const result = await api.getAvailableAssessments();
      // Handle success
    } catch (error) {
      // Handle error - redirects now use React Router navigate
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
};
```

**After (Option B - Cleaner with custom hook):**
```tsx
const MyComponent = () => {
  const api = useMultimediaApi(); // Custom hook from above

  const fetchData = async () => {
    try {
      const result = await api.getAvailableAssessments();
      // Handle success
    } catch (error) {
      // Handle error - redirects now use React Router navigate
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
};
```

### Step 3: Create Reusable API Hooks (Recommended)

Create a dedicated hooks file for your API calls:

**`src/hooks/useApi.ts`:**
```tsx
import { useAxiosApi, createMultimediaAssessmentApi } from '../service/axiosApi';

export const useMultimediaApi = () => {
  const { axiosInstance } = useAxiosApi();
  return createMultimediaAssessmentApi(axiosInstance);
};

// You can create specific hooks for different features
export const useAssessmentQueries = () => {
  const api = useMultimediaApi();
  
  const fetchAssessments = async () => {
    return await api.getAvailableAssessments();
  };

  const startAssessment = async (assessmentId: string) => {
    return await api.startAssessment(assessmentId);
  };

  return {
    fetchAssessments,
    startAssessment,
  };
};
```

**Using the custom hooks:**
```tsx
import { useAssessmentQueries } from '../hooks/useApi';

const AssessmentComponent = () => {
  const { fetchAssessments, startAssessment } = useAssessmentQueries();

  // Clean and simple usage
  const handleFetch = () => fetchAssessments();
  const handleStart = (id: string) => startAssessment(id);

  return (
    <div>
      <button onClick={handleFetch}>Fetch Assessments</button>
      <button onClick={() => handleStart('assessment-1')}>Start Assessment</button>
    </div>
  );
};
```

## Backwards Compatibility

If you have components that can't be converted immediately, the old API still works:

```tsx
import { multimediaAssessmentApi } from '../service/axiosApi';

// This still works but will use window.location.replace for redirects
const result = await multimediaAssessmentApi.getAvailableAssessments();
```

## Integration with React Query/TanStack Query

The new hooks work perfectly with React Query:

```tsx
import { useQuery } from '@tanstack/react-query';
import { useMultimediaApi } from '../hooks/useApi';

const AssessmentComponent = () => {
  const api = useMultimediaApi();

  const { data, isLoading, error } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => api.getAvailableAssessments(),
  });

  // React Query handles error states, and 401s will still redirect properly
  return <div>{/* Your component JSX */}</div>;
};
```

## Key Benefits

1. **Better UX**: No page reloads on auth failures
2. **React Router Integration**: Proper navigation with browser history
3. **State Preservation**: App state maintained during navigation
4. **Cleaner Code**: More React-like patterns
5. **Type Safety**: Full TypeScript support
6. **Backwards Compatible**: Existing code continues to work

## Migration Checklist

- [ ] Install/ensure `react-router-dom` is available
- [ ] Update components one by one to use `useAxiosApi` hook
- [ ] Create custom API hooks for common patterns
- [ ] Test authentication flows to ensure proper navigation
- [ ] Remove old imports once migration is complete
- [ ] Update error handling if needed