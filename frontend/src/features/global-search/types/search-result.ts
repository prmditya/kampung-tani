export interface NavigationItem {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon?: string;
  category: 'navigation' | 'action';
  keywords?: string[];
}

export type SearchResult = NavigationItem;
