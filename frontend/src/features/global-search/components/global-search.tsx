'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useGlobalSearch } from '../hooks/use-global-search';
import { useSearchFilter } from '../hooks/use-search-filter';
import { SearchResultItem } from './search-result-item';
import { useRouter } from 'next/navigation';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const { data: searchData, isLoading, error } = useGlobalSearch();
  const { filteredResults, groupedResults, hasResults, totalResults } =
    useSearchFilter({
      query,
      results: searchData || [],
    });

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle arrow key navigation and Enter key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
        e.preventDefault();
        router.push(filteredResults[selectedIndex].href);
        setOpen(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredResults, router]);

  // Reset query and selected index when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const handleResultSelect = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="flex justify-between bg-accent text-muted-foreground shadow-sm border border-foreground/10 hover:bg-accent/80 w-full"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="text-sm">Search...</span>
        </div>
        <KbdGroup>
          <Kbd className="bg-muted border border-foreground/10 rounded-md">
            ⌘
          </Kbd>
          <Kbd className="bg-muted border border-foreground/10 rounded-md">
            K
          </Kbd>
        </KbdGroup>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 [&>button]:hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="sr-only">Global Search</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for pages and actions..."
                className="pl-9 h-11"
                autoFocus
              />
            </div>
          </DialogHeader>

          <Separator />

          <ScrollArea className="max-h-[60vh]">
            <div className="p-2">
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {error && (
                <div className="text-center py-12 px-4">
                  <p className="text-sm font-medium text-destructive mb-2">
                    Failed to load search data
                  </p>
                  <p className="text-xs text-muted-foreground">
                    An error occurred
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Reload Page
                  </Button>
                </div>
              )}

              {!isLoading && !error && !hasResults && query && (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No results found for &quot;{query}&quot;
                  </p>
                </div>
              )}

              {!isLoading && !error && !query && searchData && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Quick navigation and actions
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Type to search • Press{' '}
                    <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded">
                      ↑↓
                    </kbd>{' '}
                    to navigate
                  </p>
                </div>
              )}

              {!isLoading && !error && hasResults && (
                <div className="space-y-4">
                  {groupedResults.navigation.length > 0 && (
                    <div>
                      <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Pages
                      </h3>
                      <div className="space-y-0.5">
                        {groupedResults.navigation.map((result, index) => {
                          const globalIndex = filteredResults.findIndex(
                            (r) => r.id === result.id,
                          );
                          return (
                            <SearchResultItem
                              key={result.id}
                              result={result}
                              onSelect={handleResultSelect}
                              isSelected={globalIndex === selectedIndex}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {groupedResults.actions.length > 0 && (
                    <div>
                      <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Quick Actions
                      </h3>
                      <div className="space-y-0.5">
                        {groupedResults.actions.map((result, index) => {
                          const globalIndex = filteredResults.findIndex(
                            (r) => r.id === result.id,
                          );
                          return (
                            <SearchResultItem
                              key={result.id}
                              result={result}
                              onSelect={handleResultSelect}
                              isSelected={globalIndex === selectedIndex}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {!isLoading && !error && hasResults && (
            <>
              <Separator />
              <div className="px-4 py-3 text-xs text-muted-foreground">
                {totalResults} result{totalResults !== 1 ? 's' : ''} found
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
