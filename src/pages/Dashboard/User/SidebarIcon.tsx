import React from "react";
import * as Icons from "@ant-design/icons";

/**
 * Maps an icon string name to its corresponding Ant Design component.
 * Supports PascalCase names (e.g., "HomeOutlined") or standard slug names.
 */
export const getIconElement = (iconName?: string): React.ReactNode => {
  if (!iconName) return <Icons.AppstoreOutlined />;

  // Normalize name to PascalCase with Outlined suffix if needed
  let normalizedName = iconName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  if (!normalizedName.endsWith('Outlined')) {
    normalizedName += 'Outlined';
  }

  // Check if icon exists in Ant Design Icons
  const IconComponent = (Icons as any)[normalizedName] || (Icons as any)[iconName];

  if (IconComponent) {
    return React.createElement(IconComponent);
  }

  // Fallback icon
  return <Icons.FileOutlined />;
};
