# Profe PAES 🎓

**Tu preuniversitario gratis** — A free AI-powered tutor for Chilean students preparing the PAES (Prueba de Acceso a la Educación Superior), Chile's university entrance exam.

Built for the **Amazon Nova Hackathon**. Powered by **Amazon Nova 2 Lite** via Amazon Bedrock.

### 🌐 [Try it live →](https://main.d257fv22orqyds.amplifyapp.com)

---

## The Problem

In Chile, private *preuniversitarios* (test prep academies) cost **$500–$2,000 USD/year** — out of reach for most families. Yet the PAES is the sole gateway to university. Students from low-income backgrounds face the exam with no structured preparation and no one to turn to for help.

**Profe PAES** gives every student a free, personal AI tutor that knows the official DEMRE curriculum, adapts to their knowledge gaps, and speaks their language — available 24/7.

---

## What it does

| Feature | Description |
|---|---|
| 🧪 **Diagnostic Test** | 7-question assessment that detects knowledge gaps across all 5 PAES subjects and recommends a study path (*humanista*, *científico*, or *mixto*) |
| 📅 **Personalized Study Plan** | 14-day calendar of daily missions based on the official DEMRE *temario*, prioritizing the student's weakest areas |
| 📖 **Mini-Lectures** | *Preuniversitario*-style lessons with clear explanations, key takeaways, and 3 PAES-level multiple-choice exercises (A/B/C/D) with instant feedback |
| 💬 **AI Tutor Chat** | WhatsApp-style conversational tutor in Chilean Spanish with clickable quick-reply suggestions |
| 📸 **Multimodal Input** | Text, voice (Web Speech API), and image upload — snap a photo of any exercise for the AI to analyze |
| 🔊 **Text-to-Speech** | Browser TTS reads AI responses aloud for auditory learners |
| 🔥 **Progress Tracking** | Streak counter, subject mastery levels (0–5), and a clickable study calendar |

### Subjects Covered

`M1` Matemáticas 1 · `M2` Matemáticas 2 · `CL` Comprensión Lectora · `CIENCIAS` Ciencias · `HIST` Historia y Cs. Sociales

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TailwindCSS |
| **AI Model** | **Amazon Nova 2 Lite** (`us.amazon.nova-2-lite-v1:0`) via Bedrock Converse API |
| **Database** | Amazon DynamoDB (PAY_PER_REQUEST) |
| **Hosting** | AWS Amplify (SSR) |

## Amazon Nova 2 Lite — One Model, Five Use Cases

All AI features are powered by a **single model** — Amazon Nova 2 Lite — through the Bedrock Converse API:

1. **💬 Conversational tutoring** — Chat in Chilean Spanish with PAES-specific context, short responses (~80 words), and clickable suggestion buttons
2. **📸 Image analysis** — Multimodal understanding of math problems, texts, and exercises from photos
3. **🧪 Diagnostic analysis** — Structured JSON output with gap levels (0–5) per subject and study path recommendation
4. **📅 Study plan generation** — 14-day personalized curriculum mapped to the DEMRE *temario*
5. **📖 Lesson generation** — Complete mini-lectures with explanations and 3 verified PAES-level exercises

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

```
BEDROCK_ACCESS_KEY_ID=your_key
BEDROCK_SECRET_ACCESS_KEY=your_secret
BEDROCK_REGION=us-east-1
```

> **Note:** We use the `BEDROCK_` prefix instead of `AWS_` because AWS Amplify reserves the `AWS_` prefix.

### 3. Set up DynamoDB

```bash
node scripts/setup-dynamodb.js
```

This creates the `profe-paes-students` table with PAY_PER_REQUEST billing.

### 4. Enable Nova 2 Lite in Bedrock

Go to **AWS Console → Bedrock → Model Access** and enable `amazon.nova-2-lite-v1:0`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy on AWS Amplify

1. Push to GitHub
2. Go to **AWS Amplify Console** → Create new app → Connect GitHub repo
3. Add environment variables: `BEDROCK_ACCESS_KEY_ID`, `BEDROCK_SECRET_ACCESS_KEY`, `BEDROCK_REGION`
4. Deploy — Amplify auto-detects Next.js SSR

> **Important:** Environment variables must use the `BEDROCK_` prefix. They are inlined at build time via `next.config.ts` since Amplify SSR functions don't receive runtime env vars.

---

## Project Structure

```
app/
  page.tsx              # Home — onboarding + daily mission dashboard
  chat/page.tsx         # AI tutor chat
  diagnostic/page.tsx   # Diagnostic test flow
  lesson/page.tsx       # Mini-lecture + exercises
  plan/page.tsx         # Study plan generator
  api/
    chat/route.ts       # Chat API endpoint
    analyze/route.ts    # Image analysis endpoint
    diagnostic/route.ts # Diagnostic test endpoint
    lesson/route.ts     # Lesson generation endpoint
    study-plan/route.ts # Study plan endpoint
lib/
  bedrock.ts            # Nova 2 Lite client + all AI functions
  dynamodb.ts           # Student profile CRUD
  paes-content.ts       # PAES subjects, careers, diagnostic questions
  student-context.tsx   # React context with localStorage persistence
  types.ts              # Shared TypeScript types
data/
  paes-content.json     # Full DEMRE temario for all 5 subjects
components/
  ChatInterface.tsx     # Voice + image upload + TTS chat UI
  DiagnosticTest.tsx    # 7-question gap detector
  DailyMission.tsx      # Home dashboard with streak + calendar
  StudyCalendar.tsx     # 14-day plan view
```

---

## License

Built with ❤️ for Chilean students. Amazon Nova Hackathon 2026.
