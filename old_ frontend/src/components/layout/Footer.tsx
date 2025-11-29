import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">ResumeMatcher</span>
          </div>
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} ResumeMatcher. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6 text-sm font-medium">
            <Link href="/services" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Services
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Terms of Service
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
