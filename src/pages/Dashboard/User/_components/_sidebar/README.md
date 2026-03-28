# Sidebar Component Refactoring

This directory contains the refactored Sidebar components split into smaller, reusable modules for better maintainability and testability.

## Structure

```
_components/_sidebar/
├── components/           # Individual UI components
│   ├── MobileToggle.tsx      # Mobile menu toggle button
│   ├── SidebarHeader.tsx     # Logo and header section
│   ├── NavigationList.tsx    # List of navigation items
│   ├── SidebarFooter.tsx     # Footer with links
│   ├── LogoutSection.tsx     # Logout button and modal
│   └── MobileOverlay.tsx     # Mobile backdrop overlay
├── constants.ts          # Menu item configurations
├── hooks.ts             # Custom hooks for sidebar logic
├── types.ts             # TypeScript type definitions
└── index.ts             # Barrel export file
```

## Components

### MobileToggle
- **Purpose**: Mobile hamburger menu toggle button
- **Props**: `isOpen: boolean`, `onToggle: () => void`
- **Usage**: Handles mobile menu show/hide state

### SidebarHeader  
- **Purpose**: Desktop logo and title display
- **Props**: `className?: string`
- **Usage**: Shows the company logo and "Dashboard" text on desktop

### NavigationList
- **Purpose**: Main navigation menu items
- **Props**: `menuItems`, `isMenuItemLocked`, `onItemClick`
- **Usage**: Renders dynamic menu based on user permissions

### SidebarFooter
- **Purpose**: Footer links (Privacy, Terms, Copyright)
- **Props**: `className?: string`
- **Usage**: Static footer content

### LogoutSection
- **Purpose**: Logout button and confirmation modal
- **Props**: `onLogout: () => void`
- **Usage**: Handles logout flow with confirmation

### MobileOverlay
- **Purpose**: Mobile backdrop overlay
- **Props**: `isOpen: boolean`, `onClose: () => void`
- **Usage**: Closes mobile menu when clicking outside

## Custom Hook

### useSidebarLogic
- **Purpose**: Contains all business logic for sidebar behavior
- **Returns**: `isOpen`, `setIsOpen`, `filteredMenuItems`, `isMenuItemLocked`
- **Features**:
  - Dynamic menu generation based on user status
  - Menu item filtering and locking logic
  - Mobile state management

## Types

### MenuItem
```typescript
interface MenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  path: string;
}
```

### UserInfo
```typescript
interface UserInfo {
  qaStatus: string;
  annotatorStatus: string;
  microTaskerStatus: string;
}
```

## Constants

### BASE_MENU_ITEMS
- Default navigation items available to all users

### QA_REVIEW_MENU_ITEM
- Additional item for QA-approved users

### ASSESSMENT_LIST_MENU_ITEM
- Additional item for annotator-approved users

## Benefits of Refactoring

1. **Separation of Concerns**: Business logic separated from UI components
2. **Reusability**: Components can be reused in other contexts
3. **Testability**: Smaller components are easier to unit test
4. **Maintainability**: Changes to specific features only affect relevant components
5. **Type Safety**: Strong TypeScript typing throughout
6. **Performance**: Memoized calculations in custom hook

## Usage Example

```tsx
import { useSidebarLogic, MobileToggle, SidebarHeader } from './_components/_sidebar';

const MySidebar = () => {
  const { userInfo } = useUserInfoStates();
  const { isOpen, setIsOpen, filteredMenuItems, isMenuItemLocked } = useSidebarLogic(userInfo);
  
  return (
    <div>
      <MobileToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <SidebarHeader />
      {/* ... other components */}
    </div>
  );
};
```