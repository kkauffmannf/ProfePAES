# Profe PAES 

**Tu preuniversitario gratis** — AI tutor for Chilean students preparing the PAES exam.

Built for the Amazon Nova Hackathon. Powered by **Amazon Nova** via Amazon Bedrock.

## What it does

- **Diagnostic test** — detects knowledge gaps (what the student doesn't know they don't know)
- **1-year study plan** — personalized daily missions based on the DEMRE official temario
- **AI Tutor chat** — text, voice (Web Speech API), and image upload (photo of any exercise)
- **Text-to-speech** — browser TTS reads AI responses aloud
- **Progress tracking** — streak counter, daily missions, gap level per subject

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + TailwindCSS |
| AI | Amazon Nova Lite + Nova Pro (via Bedrock Converse API) |
| Database | Amazon DynamoDB (PAY_PER_REQUEST) |
| Hosting | AWS Amplify |

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
DYNAMODB_TABLE=profe-paes-students
```

### 3. Create DynamoDB table

```bash
node scripts/setup-dynamodb.js
```

### 4. Run locally

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
