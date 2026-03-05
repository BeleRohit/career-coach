# 🧭 AI Career Navigator

An AI-powered career coaching platform that helps professionals land their dream roles faster. Get personalized career guidance, identify skill gaps, generate learning roadmaps, analyze your resume, and track your growth — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?logo=supabase)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3-orange)

---

## ✨ Features

### 🤖 AI Career Coach
Real-time conversational career coaching powered by Llama 3.3 70B. Get advice on career pivots, salary negotiations, interview prep, and more. Includes suggested prompt chips for new users and full conversation history.

### 📊 Skill Gap Analyzer
Enter your current skills and target role — the AI identifies exactly what you're missing and provides actionable recommendations to close the gaps.

### 📄 Resume Analyzer
Upload your resume as a PDF and get instant AI feedback including:
- **ATS Match Score** — How well your resume matches the target role
- **Missing Keywords** — Terms recruiters expect but your resume lacks
- **Critical Gaps** — Experience areas that need strengthening
- **Phrasing Improvements** — Side-by-side rewrites of weak bullet points

### 🗺️ Learning Roadmap Generator
Generate structured 3, 6, or 12-month learning plans tailored to your goals. Track progress by marking skills as completed with interactive checkboxes.

### 📓 Career Journal
Write and save personal reflections on your career journey. Entries persist in the database and can be revisited anytime.

### 📈 Personalized Dashboard
A dynamic dashboard that greets you by name, shows your activity stats, and provides quick access to all tools. Empty states guide new users with actionable prompts.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4, Shadcn UI |
| **Auth & Database** | Supabase (PostgreSQL + Row Level Security) |
| **AI** | Groq API (Llama 3.3 70B Versatile) |
| **PDF Parsing** | pdf-parse |
| **Icons** | Lucide React |
| **State** | React Hooks, Server Components |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** or **yarn**
- A free [Supabase](https://supabase.com) account
- A free [Groq](https://console.groq.com) API key

### 1. Clone the Repository

```bash
git clone https://github.com/BeleRohit/career-coach.git
cd career-coach
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### 4. Set Up Supabase Database

Run the SQL from `supabase/schema.sql` in your Supabase SQL Editor to create the required tables and Row Level Security policies.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
career-coach/
├── src/
│   ├── app/
│   │   ├── (dashboard)/        # Authenticated pages
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── chat/           # AI Career Coach
│   │   │   ├── analyzer/       # Skill Gap Analyzer
│   │   │   ├── resume/         # Resume Analyzer
│   │   │   ├── roadmap/        # Learning Roadmap
│   │   │   ├── journal/        # Career Journal
│   │   │   └── profile/        # User Settings
│   │   ├── api/                # Backend API routes
│   │   │   ├── chat/           # Groq chat endpoint
│   │   │   ├── analyze/        # Skill analysis endpoint
│   │   │   ├── resume/         # Resume PDF analysis endpoint
│   │   │   └── roadmap/        # Roadmap generation endpoint
│   │   ├── login/              # Auth pages
│   │   ├── signup/
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── layout/             # Sidebar navigation
│   │   └── ui/                 # Shadcn UI components
│   └── lib/
│       ├── supabase/           # Supabase client helpers
│       └── prompts.ts          # AI prompt templates
├── supabase/
│   └── schema.sql              # Database schema & RLS policies
├── .env.example                # Environment variable template
└── next.config.ts              # Next.js configuration
```

---

## 🗄️ Database Schema

The application uses four main tables in Supabase:

| Table | Purpose |
|-------|---------|
| `career_sessions` | Stores AI coaching conversation history |
| `roadmaps` | Persists generated learning roadmaps and skill analyses |
| `journal_entries` | Saves career journal reflections |

All tables are protected with Row Level Security (RLS) — users can only access their own data.

---

## 🌐 Deployment

### Vercel (Recommended for Frontend + API)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GROQ_API_KEY`)
4. Deploy

### Environment Variables for Production

Ensure the following are set in your deployment platform:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `GROQ_API_KEY` | Your Groq API key |

---

## � Future Improvements

### 🎙️ Interview Simulator
A dedicated mock interview mode where the AI plays the interviewer, asks real questions for a specific role, and scores your answers with detailed feedback. Much more engaging and targeted than a generic chat.

### 🎯 Job Description Matcher
Paste any job description and get an instant breakdown of how well your profile matches, what's missing, and how to position yourself for that specific role.

### 📅 Weekly Check-in
A short weekly prompt — *"What did you work on this week? What's blocking you?"* — that builds a progress log over time and keeps you accountable and coming back consistently.

---

## �📝 License

This project is for educational and personal use. Feel free to fork and build upon it.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with ☕ and AI by [Rohit Bele](https://github.com/BeleRohit)
