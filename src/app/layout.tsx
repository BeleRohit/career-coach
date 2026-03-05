import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Career Navigator",
  description: "Your calm digital career mentor. Analyze skills, generate roadmaps, and find clarity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        {/* Simple integration for plausible or umami (mock snippet for standard analytics) */}
        <script defer data-domain="ai-career-navigator.vercel.app" src="https://plausible.io/js/script.js"></script>
      </head>
      <body className={`${inter.className} min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-zinc-200 dark:selection:bg-zinc-800`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
