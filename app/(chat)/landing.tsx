'use client';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { LightbulbIcon, MountainIcon, RocketIcon, ShieldCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Landing() {
  const sidebar = useSidebar();

  useEffect(() => {
    sidebar.setOpen(false);
  }, [sidebar]);

  return (
  <div className="flex flex-col min-h-screen">
  <header className="container mx-auto px-4 lg:px-6 h-14 flex items-center">
    <Link className="flex items-center justify-center" href="#">
      <MountainIcon className="h-6 w-6" />
      <span className="ml-2 text-2xl font-bold">Schrodinger AI</span>
    </Link>
    <nav className="ml-auto flex gap-4 sm:gap-6">
      <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
        Features
      </Link>
      <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
        Pricing
      </Link>
      <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
        About
      </Link>
      <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
        Contact
      </Link>
    </nav>
    <div className="ml-4">
      <ModeToggle />
    </div>
  </header>
  <main className="flex-1">
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Finally see inside the box
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Demystifying AI hallucination, building trust, and streamlining routine tasks with unmatched accuracy.
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/login"><Button>Get Started</Button></Link>
            <Button variant="outline">Learn More</Button>
          </div>
        </div>
      </div>
    </section>
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
            <LightbulbIcon className="h-10 w-10" />
            <h2 className="text-xl font-bold">Demystifying Hallucination</h2>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Understand and mitigate AI hallucinations for more reliable outputs.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
            <ShieldCheckIcon className="h-10 w-10" />
            <h2 className="text-xl font-bold">Building Trust</h2>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Transparent AI processes that you can rely on with confidence.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
            <RocketIcon className="h-10 w-10" />
            <h2 className="text-xl font-bold">Unmatched Accuracy</h2>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Streamline routine tasks with AI that delivers precise results.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
  <footer className="container mx-auto flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
    <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 Schrodinger AI. All rights reserved.</p>
    <nav className="sm:ml-auto flex gap-4 sm:gap-6">
      <Link className="text-xs hover:underline underline-offset-4" href="#">
        Terms of Service
      </Link>
      <Link className="text-xs hover:underline underline-offset-4" href="#">
        Privacy
      </Link>
    </nav>
  </footer>
    </div>
  )
}