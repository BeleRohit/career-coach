import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, BrainCircuit, Map, BookOpen, Star } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50 transition-colors duration-300 scroll-smooth">
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

      <main className="flex-1 flex flex-col items-center justify-center space-y-24 py-24 px-6 md:px-12 text-center relative overflow-hidden">

        {/* Background Depth & Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] opacity-20 dark:opacity-40 pointer-events-none -z-10 blur-[100px] rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

        <section className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/80 px-4 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-6 shadow-sm backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Stop guessing your next career move
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl leading-tight">
            Land Your Dream Role <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Faster.</span>
          </h1>

          <p className="max-w-[42rem] mx-auto text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl leading-relaxed">
            Close your skill gaps and get unstuck. Connect with a brilliant AI mentor to build the exact progressive roadmap you need to level up your career today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 items-center">
            <Button asChild size="lg" className="rounded-full shadow-lg shadow-indigo-500/20 text-base px-8 h-14 bg-indigo-600 hover:bg-indigo-700 text-white border-0 transition-all hover:scale-105">
              <Link href="/signup">
                Start Navigating <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full text-base px-8 h-14 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              <a href="#features">Learn More</a>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-12 flex flex-col items-center justify-center space-y-3 opacity-90">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Joined by <span className="text-zinc-900 dark:text-zinc-100 font-bold">2,000+</span> professionals accelerating their careers.
            </p>
          </div>
        </section>

        {/* Floating UI Preview */}
        <section className="w-full max-w-5xl mx-auto pt-8 pb-12 animate-in fade-in slide-in-from-bottom-12 duration-1200 delay-300 relative z-10 px-4 md:px-0 hidden md:block">
          <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md p-3 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/10 dark:from-white/10 dark:to-transparent pointer-events-none"></div>
            <div className="relative rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex aspect-[21/9] min-h-[400px] shadow-inner">

              {/* Sidebar mockup */}
              <div className="w-[200px] lg:w-[240px] border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-6 bg-white dark:bg-zinc-950/80 shrink-0">
                <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                <div className="space-y-4 mt-4 flex-1">
                  <div className="h-8 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-md flex items-center px-3 gap-3">
                    <div className="h-4 w-4 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                    <div className="h-3 w-1/2 bg-zinc-300 dark:bg-zinc-700 rounded-sm"></div>
                  </div>
                  <div className="h-8 w-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-md flex items-center px-3 gap-3">
                    <div className="h-4 w-4 rounded-full bg-indigo-400 dark:bg-indigo-500"></div>
                    <div className="h-3 w-2/3 bg-indigo-400 dark:bg-indigo-500 rounded-sm"></div>
                  </div>
                  <div className="h-8 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-md flex items-center px-3 gap-3">
                    <div className="h-4 w-4 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                    <div className="h-3 w-1/3 bg-zinc-300 dark:bg-zinc-700 rounded-sm"></div>
                  </div>
                </div>
              </div>

              {/* Main content area mockup */}
              <div className="flex-1 p-8 flex flex-col relative bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div className="h-8 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                  <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                </div>

                {/* Dashboard Grid */}
                <div className="flex-1 grid grid-cols-2 gap-6 pb-4">
                  {/* Card 1: Progress */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm relative overflow-hidden transform transition-transform group-hover:scale-[1.02] duration-500 flex flex-col justify-between z-10">
                    <div>
                      <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
                      <div className="h-8 w-1/2 bg-zinc-300 dark:bg-zinc-700 rounded mb-6"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <div className="h-2 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                          <div className="h-2 w-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full w-[80%] bg-indigo-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <div className="h-2 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                          <div className="h-2 w-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full w-[45%] bg-purple-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: List */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm relative overflow-hidden transform transition-transform group-hover:scale-[1.02] delay-75 duration-500 flex flex-col z-10">
                    <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="h-12 w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg flex items-center px-4 gap-3">
                        <div className="h-4 w-4 rounded-full border-2 border-green-500 flex-shrink-0"></div>
                        <div className="h-2 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                      </div>
                      <div className="h-12 w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg flex items-center px-4 gap-3">
                        <div className="h-4 w-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 flex-shrink-0"></div>
                        <div className="h-2 w-1/2 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                      </div>
                      <div className="h-12 w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg flex items-center px-4 gap-3 opacity-50">
                        <div className="h-4 w-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 flex-shrink-0"></div>
                        <div className="h-2 w-2/3 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating decorative elements */}
                <div className="absolute bottom-[-10%] right-[-5%] h-64 w-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none z-0"></div>
                <div className="absolute top-[-10%] left-[20%] h-48 w-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none z-0"></div>
              </div>
            </div>
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
