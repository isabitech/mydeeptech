// Frontend Debug: Add this to AdminSidebar.tsx to log the API response
// Add this inside the SidebarMenus component, after useSidebarResources()

console.log("🔍 Sidebar Debug:", {
  resources,
  loading,
  error,
  resourcesLength: resources?.length || 0
});

// Add this to check user info
const { userInfo } = useUserInfoStates();
console.log("👤 User Info Debug:", {
  userInfo,
  hasRolePermission: !!userInfo?.role_permission,
  rolePermissionActive: userInfo?.role_permission?.isActive,
  roleName: userInfo?.role_permission?.name || userInfo?.role,
  permissionsCount: userInfo?.role_permission?.permissions?.length || 0
});