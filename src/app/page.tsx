import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, BrainCircuit, Map, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <Compass className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
          <span className="font-semibold text-lg tracking-tight">AI Career Navigator</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6 items-center">
          <ThemeToggle />
          <Link className="text-sm font-medium hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" href="/login">
            Log in
          </Link>
          <Button asChild variant="default" className="rounded-full px-6">
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center space-y-24 py-24 px-6 md:px-12 text-center">
        <section className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            Your Calm Digital Career Mentor
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Find Clarity in Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-800 dark:from-zinc-400 dark:to-zinc-100">Career Journey.</span>
          </h1>
          <p className="max-w-[42rem] mx-auto text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl leading-relaxed">
            Stop guessing what skills to learn next. Get AI-driven guidance, personalized skill analysis, and structured learning roadmaps to land your dream role.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button asChild size="lg" className="rounded-full shadow-md text-base px-8 h-14">
              <Link href="/signup">
                Start Navigating <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full text-base px-8 h-14 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="w-full max-w-6xl pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BrainCircuit className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />}
              title="AI Career Coach"
              description="Chat with a thoughtful AI mentor that helps you explore potential career paths tailored to your unique interests and background."
            />
            <FeatureCard
              icon={<Map className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />}
              title="Skill Gap Analyzer"
              description="Identify exactly what you're missing for your target role and get actionable recommendations on the next technologies to learn."
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />}
              title="Tailored Roadmaps"
              description="Generate realistic 3-month, 6-month, and 12-month learning plans packed with project ideas and curated resources."
            />
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 w-full text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>© {new Date().getFullYear()} AI Career Navigator. Open-source and free.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow duration-300 text-zinc-950 dark:text-zinc-50">
      <div className="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 tracking-tight">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
