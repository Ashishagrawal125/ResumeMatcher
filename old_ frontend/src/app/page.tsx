import MatchTool from '@/components/MatchTool';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-20 md:py-32 lg:py-40 bg-card border-b">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-4">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Land Your Dream Job Faster
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  Our AI-powered platform analyzes your resume against any job description, providing an instant match score and insights to help you tailor your application and stand out.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="#match-tool">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/services">
                    Explore Services
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              alt="Hero"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              src={heroImage?.imageUrl || "https://picsum.photos/seed/1/1200/800"}
              width={1200}
              height={800}
              data-ai-hint="abstract tech"
            />
          </div>
        </div>
      </section>

      <section id="match-tool" className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">The Ultimate Resume Matcher</h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Paste your resume and the job description below to see how well you match. Get instant feedback and improve your chances.
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-5xl mt-12">
            <MatchTool />
          </div>
        </div>
      </section>
    </div>
  );
}
