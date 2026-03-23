import React from "react";
import { Button, ButtonProps } from "antd"; 
import { usePermission } from "../hooks/usePermission";
import { Action } from "../utils/permissions";

interface PermissionButtonProps extends Omit<ButtonProps, 'disabled'> {
  resource: string;
  action: Action | string;
  disabled?: boolean;
}

/**
 * A specialized button that only renders if the user has permission.
 */
export const PermissionButton: React.FC<PermissionButtonProps> = ({ 
  resource, 
  action, 
  children, 
  disabled,
  ...props 
}) => {
  const { can, isLoading } = usePermission(resource);

  // If loading, show disabled button with a spinner instead of label
  if (isLoading) {
    return (
      <Button {...props} disabled loading icon={null}>
        <span className="opacity-0">{children}</span>
      </Button>
    );
  }

  // If no permission, remove from DOM entirely
  if (!can(action)) {
    return null;
  }

  // Has permission: render normally
  return (
    <Button {...props} disabled={disabled}>
      {children}
    </Button>
  );
};

export default PermissionButton;
