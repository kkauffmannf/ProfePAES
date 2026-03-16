# Profe PAES 🎓

**Tu preuniversitario gratis** — Free AI tutor for Chilean students preparing the PAES (Prueba de Acceso a la Educación Superior).

Built for the **Amazon Nova Hackathon**. Powered by **Amazon Nova 2 Lite** via Amazon Bedrock.

## What it does

- **Diagnostic test** — 7-question gap detector across M1, M2, Comp. Lectora, Ciencias, and Historia
- **Personalized study plan** — 14-day daily missions based on the official DEMRE temario, prioritizing weak areas
- **Mini-lectures** — preuniversitario-style lessons with explanations, key points, and 3 PAES-level exercises (A/B/C/D)
- **AI Tutor chat** — WhatsApp-style short responses with clickable quick-reply suggestions
- **Multimodal input** — text, voice (Web Speech API), and image upload (photo of any exercise)
- **Text-to-speech** — browser TTS reads AI responses aloud
- **Progress tracking** — streak counter, subject levels, clickable study calendar

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TailwindCSS |
| AI Model | **Amazon Nova 2 Lite** (`us.amazon.nova-2-lite-v1:0`) via Bedrock Converse API |
| Database | Amazon DynamoDB (PAY_PER_REQUEST) |
| Hosting | AWS Amplify |

## Amazon Nova 2 Lite Usage

All AI features use **Amazon Nova 2 Lite** (the latest Nova model, Dec 2025) through the Bedrock Converse API:

- **Chat** — conversational tutoring in Chilean Spanish with PAES context
- **Image analysis** — multimodal understanding of math problems, texts, and exercises
- **Diagnostic analysis** — gap detection and study path recommendation
- **Study plan generation** — structured 14-day personalized curriculum
- **Lesson generation** — mini-lectures with explanations and verified exercises

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

```
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

### 3. Enable Nova 2 Lite in Bedrock

Go to AWS Console > Bedrock > Model Access and enable `amazon.nova-2-lite-v1:0`.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on AWS Amplify

1. Push to GitHub
2. Go to AWS Amplify Console > Create new app > Connect GitHub repo
3. Add environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)
4. Deploy — Amplify auto-detects Next.js SSR
