import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass, Home, LifeBuoy, MapPinX, Sprout } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16 sm:px-10">
      <div
        className="absolute inset-0 -z-20 bg-gradient-to-br from-primary/5 via-background to-secondary/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_65%)]"
        aria-hidden="true"
      />
      <section className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-10 shadow-2xl shadow-primary/10 backdrop-blur">
        <div
          className="absolute right-12 top-12 h-48 w-48 -translate-y-1/2 rounded-full border border-primary/20 bg-primary/20 blur-2xl -z-10"
          aria-hidden="true"
        />
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          <Sprout className="size-4" aria-hidden="true" />
          Off the beaten path
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-accent-foreground sm:text-7xl">
          404
        </h1>
        <h2 className="text-xl text-accent-foreground">Page not found</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          The page you were looking for seems to have wandered among the fields.
          Double-check the address or head back to safer ground.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild className="px-6">
            <Link href="/">
              <Home className="size-4" aria-hidden="true" />
              Go to home
            </Link>
          </Button>
          <Button asChild variant="outline" className="px-6">
            <Link href="/dashboard">
              <Compass className="size-4" aria-hidden="true" />
              Explore dashboard
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 rounded-2xl border border-border/60 bg-muted/30 p-6 text-sm leading-6 text-muted-foreground">
          <div className="flex items-start gap-3">
            <MapPinX
              className="mt-0.5 size-5 text-primary"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-foreground">Check the URL</p>
              <p>
                Typos happen, so make sure the page address is spelled correctly
                or try using the main navigation.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <LifeBuoy
              className="mt-0.5 size-5 text-secondary"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-foreground">Still need help?</p>
              <p>
                Reach out to the team if something feels off, and we&apos;ll
                guide you back on track.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
