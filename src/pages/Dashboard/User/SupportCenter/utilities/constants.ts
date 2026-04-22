// Utility functions and constants for SupportCenter

// Status color mapping
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'open': return 'blue';
    case 'in_progress': return 'orange';
    case 'waiting_for_user': return 'purple';
    case 'resolved': return 'green';
    case 'closed': return 'gray';
    default: return 'blue';
  }
};

// Priority color mapping
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return 'red';
    case 'medium': return 'orange';
    case 'low': return 'green';
    default: return 'blue';
  }
};

// Date formatting utility
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Animation configurations
export const ANIMATIONS = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  },
  listItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    getTransition: (index: number) => ({ duration: 0.3, delay: index * 0.1 })
  }
};

// Common styles
export const STYLES = {
  fonts: {
    regular: "font-['gilroy-regular']",
    medium: "font-['gilroy-medium']",
    semibold: "font-['gilroy-semibold']",
    bold: "font-['gilroy-bold']"
  },
  colors: {
    primary: '#F6921E',
    text: '#333333'
  }
};