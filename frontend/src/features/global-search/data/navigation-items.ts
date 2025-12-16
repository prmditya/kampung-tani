import type { NavigationItem } from '../types/search-result';

export const navigationItems: NavigationItem[] = [
  // Dashboard
  {
    id: 'dashboard-home',
    title: 'Dashboard',
    description: 'Overview and statistics',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    category: 'navigation',
    keywords: ['home', 'overview', 'stats', 'main'],
  },

  // Devices
  {
    id: 'devices',
    title: 'Devices',
    description: 'Gateways and sensors',
    href: '/dashboard/devices',
    icon: 'HardDrive',
    category: 'navigation',
    keywords: ['gateway', 'sensor', 'hardware', 'iot'],
  },

  // Farmers
  {
    id: 'farmers',
    title: 'Farmers',
    description: 'Farmer management',
    href: '/dashboard/farmers',
    icon: 'Users',
    category: 'navigation',
    keywords: ['user', 'people', 'contact'],
  },

  // Assignments
  {
    id: 'assignments',
    title: 'Assignments',
    description: 'Gateway-to-farm mapping',
    href: '/dashboard/assignments',
    icon: 'Unplug',
    category: 'navigation',
    keywords: ['allocation', 'mapping', 'connect'],
  },

  // Data
  {
    id: 'data',
    title: 'Sensor Data',
    description: 'Readings and analytics',
    href: '/dashboard/data',
    icon: 'LineChart',
    category: 'navigation',
    keywords: ['readings', 'analytics', 'charts', 'metrics'],
  },

  // Summary
  {
    id: 'summary',
    title: 'User Summary',
    description: 'Reports and recommendations',
    href: '/dashboard/summary',
    icon: 'FileText',
    category: 'navigation',
    keywords: ['summary', 'report', 'analytics', 'metrics', 'data', 'user'],
  },

  // Settings
  {
    id: 'settings',
    title: 'Settings',
    description: 'App settings',
    href: '/dashboard/settings',
    icon: 'Settings',
    category: 'navigation',
    keywords: ['config', 'preferences', 'account'],
  },

  // Quick Actions
  {
    id: 'add-gateway',
    title: 'Add New Gateway',
    description: 'Register new gateway',
    href: '/dashboard/devices?action=add',
    icon: 'Plus',
    category: 'action',
    keywords: ['create', 'new', 'device', 'register'],
  },
  {
    id: 'add-farmer',
    title: 'Add New Farmer',
    description: 'Register new farmer',
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
