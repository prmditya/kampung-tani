'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            '!bg-card text-card-foreground !shadow-sm rounded-lg min-w-[350px] !px-5 !py-4 border !transition-all',
          title: 'text-[0.9375rem] font-semibold leading-normal',
          description: 'text-sm opacity-85 mt-1',
          success: '!border-primary/30',
          error: '!border-destructive/30',
          icon: 'w-5 h-5',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
