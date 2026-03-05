# AI Career Navigator

A calm, zero-budget, open-source AI career coaching platform built for students, career changers, and self-learners. Identify skill gaps, chat with an AI mentor, and generate personalized learning roadmaps.

## 🌟 Features MVP
- **Landing Page**: Minimalist introduction inspired by Notion/Linear.
- **AI Career Coach Chat**: A conversational mentor using Groq's Llama models.
- **Skill Gap Analyzer**: Evaluate current skills against your dream job using AI.
- **Roadmap Generator**: Create actionable 3, 6, and 12-month learning plans.
- **Career Journal**: Track reflections and receive automated AI insights on entries.

## 🛠️ Tech Stack
- **Frontend Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Database & Auth:** Supabase (PostgreSQL)
- **AI Provider:** Groq LLM API (Llama 3 Models)
- **Deployment:** Vercel

## 🚀 Getting Started Locally

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd career-coach
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file by copying the provided example:
```bash
cp .env.example .env.local
```
Fill in the following credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Project Anon Key
- `GROQ_API_KEY`: A free API key from [Groq Console](https://console.groq.com/keys)

### 3. Setup Supabase Database
1. Create a free organization/project at [Supabase](https://supabase.com/).
2. Navigate to your project dashboard's SQL Editor.
3. Open `supabase/schema.sql` from this repository.
4. Copy and execute the contents to automatically generate the necessary tables, Row-Level Security policies, and User triggers.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## 📦 Deployment Instructions

### Vercel
1. Push your code to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Add the Environment Variables to Vercel Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
5. Click **Deploy**. Vercel will automatically build and host the Next.js app.

## 🔒 Privacy & Architecture
The system does not mandate storing high-risk sensitive data.
- **Stateless Prompts:** The AI API route evaluates conversations server-side, meaning Groq keys are never exposed to the client.
- **Data Protection:** Supabase Row Level Security ensures users can only access their own sessions and data based on authentication ids.

---

Built with calm focus and a mission to make career guidance free and accessible.
