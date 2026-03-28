import { ReactNode } from 'react';
import { UserInfoData } from '../../../../../store/useAuthStore';

export interface MenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  path: string;
}

export interface SidebarProps {
  className?: string;
}

export interface MobileToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface SidebarHeaderProps {
  className?: string;
}

export interface NavigationListProps {
  menuItems: MenuItem[];
  isMenuItemLocked: (itemKey: string) => boolean;
  onItemClick: () => void;
}

export interface SidebarFooterProps {
  className?: string;
}

export interface LogoutSectionProps {
  onLogout: () => void;
}

export interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export type { UserInfoData };