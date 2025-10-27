'use client';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { usePathname } from 'next/dist/client/components/navigation';

export default function NavBreadcrumbs() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter((path) => path);

    return paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      const isLast = index === paths.length - 1;

      return { href, label, isLast };
    });
  };

  const breadcrumbs = generateBreadcrumbs();
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isLast && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
