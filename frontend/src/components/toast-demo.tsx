'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        onClick={() =>
          toast.success('Success', {
            description: 'Your operation completed successfully!',
          })
        }
      >
        Success Toast
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast.error('Error', {
            description: 'Something went wrong. Please try again.',
          })
        }
      >
        Error Toast
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast.warning('Warning', {
            description: 'Please review your input before proceeding.',
          })
        }
      >
        Warning Toast
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast.info('Information', {
            description: "Here's some useful information for you.",
          })
        }
      >
        Info Toast
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast.loading('Loading...', { description: 'Please wait' })
        }
      >
        Loading Toast
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast('Default Toast', {
            description: 'This is a default toast notification.',
          })
        }
      >
        Default Toast
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast.success('With Action', {
            description: 'You can add action buttons too!',
            action: {
              label: 'Undo',
              onClick: () => toast.info('Undo clicked!'),
            },
          })
        }
      >
        Toast with Action
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast('Rich Content', {
            description: 'This toast demonstrates all the styling features.',
            duration: 10000,
            action: {
              label: 'View',
              onClick: () => toast.info('View clicked!'),
            },
            cancel: {
              label: 'Dismiss',
              onClick: () => {},
            },
          })
        }
      >
        Rich Toast
      </Button>
    </div>
  );
}
