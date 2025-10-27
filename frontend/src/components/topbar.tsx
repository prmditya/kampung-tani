import { SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggler from './theme-toggler';
import NavBreadcrumbs from './nav-breadcrumbs';

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background px-2 sm:px-4 md:px-6 ">
      <SidebarTrigger className="-ml-1" />

      <NavBreadcrumbs />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <ThemeToggler />
      </div>
    </header>
  );
}
