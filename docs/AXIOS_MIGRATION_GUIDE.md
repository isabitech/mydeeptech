# API Migration Guide: From Fetch to Axios

This guide shows how to convert your existing fetch-based API calls to use the new axios configuration that properly handles error messages.

## ✅ **What We've Set Up**

### 1. **Axios Instance** (`/src/service/axiosApi.ts`)
- ✅ Configured with base URL from your environment
- ✅ Automatic token injection from encrypted storage
- ✅ Enhanced error handling that extracts API error messages
- ✅ Response/Request interceptors for consistent behavior
- ✅ 30-second timeout for requests

### 2. **API Utilities** (`/src/service/apiUtils.ts`)
- ✅ Simple wrapper functions: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`
- ✅ File upload helper: `apiUpload`
- ✅ Error message extraction: `getErrorMessage`
- ✅ URL builder: `createApiUrl`
- ✅ Error type checkers: `isNetworkError`, `isAuthError`

## 📝 **Migration Patterns**

### **Before (Fetch):**
```typescript
const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoints.adminProject.createProject}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify(projectData),
});

if (!response.ok) {
  if (response.status === 401) {
    throw new Error("Unauthorized. Please log in again.");
  }
  throw new Error(`Request failed with status ${response.status}`);
}

const data = await response.json();
```

### **After (Axios):**
```typescript
const data = await apiPost(endpoints.adminProject.createProject, projectData);
```

## 🔄 **Quick Conversion Examples**

### **GET Request with Parameters**
```typescript
// Before
const queryParams = new URLSearchParams();
if (params?.page) queryParams.append('page', params.page.toString());
const url = `${baseURL}${endpoint}?${queryParams.toString()}`;
const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

// After
const queryParams = { page: params?.page?.toString() };
const data = await apiGet(endpoint, { params: queryParams });
```

### **POST Request**
```typescript
// Before
const response = await fetch(`${baseURL}${endpoint}`, {
  method: "POST",
  body: JSON.stringify(body),
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
});

// After
const data = await apiPost(endpoint, body);
```

### **PUT/PATCH Request**
```typescript
// Before
const response = await fetch(`${baseURL}${endpoint}/${id}`, {
  method: "PUT",
  body: JSON.stringify(updateData),
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
});

// After
const url = createApiUrl(endpoint, id);
const data = await apiPut(url, updateData);
// OR
const data = await apiPatch(url, updateData);
```

### **DELETE Request**
```typescript
// Before
const response = await fetch(`${baseURL}${endpoint}/${id}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` }
});

// After
const url = createApiUrl(endpoint, id);
const data = await apiDelete(url);
```

## 🎯 **Enhanced Error Handling**

### **Before (Manual Error Handling):**
```typescript
catch (err: any) {
  const errorMessage = err.message || "An error occurred";
  setError(errorMessage);
  return { success: false, error: errorMessage };
}
```

### **After (Enhanced Error Messages):**
```typescript
catch (err: any) {
  const errorMessage = getErrorMessage(err); // Extracts API error messages properly
  setError(errorMessage);
  return { success: false, error: errorMessage };
}
```

## 📁 **Files to Migrate**

### **Hook Files to Convert:**
1. `useAdminProjects.ts` ➜ ✅ **Done** (`useAdminProjects_axios.ts` created)
2. `useUserProjects.ts` ➜ ✅ **Done** (`useUserProjects_axios.ts` created)
3. `useAdminApplications.ts` ➜ 🔄 **Needs conversion**
4. `useUserActiveProjects.ts` ➜ 🔄 **Needs conversion**
5. `useLogin.ts` ➜ 🔄 **Needs conversion**
6. `useSignUp.ts` ➜ 🔄 **Needs conversion**
7. Any other hooks with fetch calls

### **Component Files to Check:**
- Look for direct fetch calls in components
- Update import statements to use new axios hooks

## 🚀 **How to Apply Changes**

### **Step 1: Replace Hook Imports**
```typescript
// Before
import { useAdminProjects } from "../../../../hooks/Auth/Admin/Projects/useAdminProjects";

// After
import { useAdminProjects } from "../../../../hooks/Auth/Admin/Projects/useAdminProjects_axios";
```

### **Step 2: Test Error Handling**
The new axios setup will now properly extract error messages from your API responses in these formats:
- `{ message: "Error message" }`
- `{ error: "Error message" }`
- `{ error: { message: "Error message" } }`
- `{ errors: ["Error 1", "Error 2"] }`
- `{ errors: { field: ["Error message"] } }`

### **Step 3: Update Direct API Calls**
If you have any direct fetch calls in components, convert them:
```typescript
// Before
const response = await fetch(url, options);

// After
import { apiPost, getErrorMessage } from "../../service/apiUtils";
try {
  const data = await apiPost(endpoint, body);
} catch (error) {
  console.error(getErrorMessage(error));
}
```

## ⚡ **Benefits of New Setup**

1. **Better Error Messages**: Automatically extracts and displays API error messages
2. **Automatic Token Management**: No need to manually add Authorization headers
3. **Consistent Error Handling**: Standardized error format across all API calls
4. **Less Boilerplate**: Significantly less code per API call
5. **Type Safety**: Better TypeScript support with axios
6. **Network Error Detection**: Built-in network and auth error detection
7. **File Upload Support**: Ready-to-use file upload functionality

## 🛠 **Next Steps**

1. **Test the new hooks**: Replace imports in your components with the `_axios` versions
2. **Monitor error messages**: Check that API errors are now properly displayed
3. **Convert remaining hooks**: Apply the same pattern to other hooks
4. **Remove old files**: Once testing is complete, replace original files
5. **Update components**: Replace any direct fetch calls with axios utilities

The migration maintains the exact same interface, so your components won't need any changes other than import paths!