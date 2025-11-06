import type { NavigationItem } from '../types/search-result';

export const navigationItems: NavigationItem[] = [
  // Dashboard
  {
    id: 'dashboard-home',
    title: 'Dashboard',
    description: 'View overview and statistics',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    category: 'navigation',
    keywords: ['home', 'overview', 'stats', 'main'],
  },

  // Devices
  {
    id: 'devices',
    title: 'Devices',
    description: 'Manage gateways and sensors',
    href: '/dashboard/devices',
    icon: 'HardDrive',
    category: 'navigation',
    keywords: ['gateway', 'sensor', 'hardware', 'iot'],
  },

  // Farmers
  {
    id: 'farmers',
    title: 'Farmers',
    description: 'Manage farmers and their information',
    href: '/dashboard/farmers',
    icon: 'Users',
    category: 'navigation',
    keywords: ['user', 'people', 'contact'],
  },

  // Assignments
  {
    id: 'assignments',
    title: 'Assignments',
    description: 'Manage gateway-to-farm assignments',
    href: '/dashboard/assignments',
    icon: 'Unplug',
    category: 'navigation',
    keywords: ['allocation', 'mapping', 'connect'],
  },

  // Data
  {
    id: 'data',
    title: 'Sensor Data',
    description: 'View sensor readings and analytics',
    href: '/dashboard/data',
    icon: 'LineChart',
    category: 'navigation',
    keywords: ['readings', 'analytics', 'charts', 'metrics'],
  },

  // Settings
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure application settings',
    href: '/dashboard/settings',
    icon: 'Settings',
    category: 'navigation',
    keywords: ['config', 'preferences', 'account'],
  },

  // Quick Actions
  {
    id: 'add-gateway',
    title: 'Add New Gateway',
    description: 'Register a new gateway device',
    href: '/dashboard/devices?action=add',
    icon: 'Plus',
    category: 'action',
    keywords: ['create', 'new', 'device', 'register'],
  },
  {
    id: 'add-farmer',
    title: 'Add New Farmer',
    description: 'Register a new farmer',
    href: '/dashboard/farmers?action=add',
    icon: 'UserPlus',
    category: 'action',
    keywords: ['create', 'new', 'register'],
  },
  {
    id: 'create-assignment',
    title: 'Create Assignment',
    description: 'Assign gateway to farm',
    href: '/dashboard/assignments?action=add',
    icon: 'Link',
    category: 'action',
    keywords: ['assign', 'connect', 'map'],
  },
];
