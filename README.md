<div align="center">
  <img src="public/favicon.svg" alt="Mindhouse Logo" width="150">
  <h1>Mindhouse - AI-Powered Learning Platform</h1>
  <p>
    <strong>An AI-powered study companion that personalizes your learning: it detects knowledge gaps, generates practice questions, and guides you with an intelligent tutor.</strong>
  </p>
  <p>
    <a href="https://mindhouse.vercel.app/"><strong>Visit Live Demo »</strong></a>
  </p>

  <!-- Project Status Badges -->
  <p>
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
    <img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version">
    <img src="https://img.shields.io/badge/status-production-green.svg" alt="Status">
    <img src="https://deploy-badge.vercel.app/vercel/mindhouse?root=landing" alt="Vercel Deploy Status">
    <img src="https://img.shields.io/github/languages/top/neurodivergent-dev/mindhouse" alt="Top Language">
    <img src="https://img.shields.io/github/languages/code-size/neurodivergent-dev/mindhouse" alt="Code Size">
    <img src="https://img.shields.io/github/repo-size/neurodivergent-dev/mindhouse" alt="Repo Size">
    <img src="https://img.shields.io/badge/AI-Powered-orange.svg" alt="AI Powered">
    <img src="https://img.shields.io/badge/Voice-Assistant-blue.svg" alt="Voice Assistant">
  </p>
  <br>
</div>

## ✨ Why Mindhouse?

Mindhouse goes beyond traditional study tools by focusing on each student's unique needs. It doesn't just display question banks; **it detects your learning gaps, offers personalized study strategies, and supports your entire study workflow with an intelligent assistant.** Our mission is to make learning more efficient, accessible, and personal.

This project was built to transform the learning experience using modern web technologies and generative AI.

## 🚀 Core Features

### **🤖 Advanced AI-Powered Study System:**

- **AI-Powered Question Generation:** Automatically generates high-quality questions using Google Gemini AI, customized by subject, topic, difficulty, and optional custom instructions.
- **AI-Powered Subject & Topic Generation:** Automatically constructs subjects and topics, performs quality checks, and sets study objectives.
- **AI Topic Explainer:** Generates comprehensive step-by-step topic summaries in clean Markdown layout.
- **AI Image Generation:** Generates subject-relevant illustrations dynamically via Pollinations.ai.
- **AI Tutor Chat:** Interactive chat helper to clarify concepts, offer hints, and walk through solutions step-by-step.
- **Voice AI Assistant:** Hands-free interaction supporting Turkish speech-to-text and text-to-speech.
- **Persistent Local History:** Local chat sessions saved securely in IndexedDB for guests and authenticated users.

### **🎤 Voice Assistant Features:**

- **Turkish Speech Recognition:** Real-time speech-to-text using Web Speech API.
- **Voice Navigation Commands:** Voice controls like "read question", "show options", "read hint", and "explain solution".
- **Text-to-Speech:** Natural audio readouts of AI responses and study texts.
- **Real-time Transcript UI:** Live interactive text transcription as you speak.

### **📚 Advanced Study Tools:**

- **Smart Flashcards:** Digital study cards operating on a Spaced Repetition scientific interval algorithm to optimize retention.
- **Performance Analytics:** Visual charts and metrics to track study progress and topic success rates.
- **Rich Markdown Formatting:** Beautifully rendered educational contents with highlight code blocks and media.

### **🎨 Modern User Experience:**

- **PWA Support:** Progressive Web App capabilities for offline usage and home-screen installation.
- **Polished UI:** Dark/light modes, glassmorphism styling, responsive layouts, and smooth micro-animations.
- **Robust Error Handling:** Informative user-friendly notifications and fallbacks.

### **⚙️ Security & Management:**

- **Comprehensive Admin Panels:** Effortless CRUD management panels for subjects, topics, and question banks.
- **Data Management:** Export, import, cloud backup, restore, and profile deletion tools.
- **Secure Authentication:** Supabase Auth integrations with safe password update modules.
- **Cloudinary Storage:** Secure avatar uploads and file management.

## 📋 Quality Assurance

This project follows a comprehensive manual quality assurance process. For details:

### **🔍 Manual Test Checklist**

- **[📋 QUALITY_ASSURANCE.md](docs/QUALITY_ASSURANCE.md)** - Detailed manual QA checklist.
- **Test Coverage:** UI/UX, Performance, Security, Accessibility, Cross-browser, Cross-device
- **Scenarios:** Manual test points covering AI features, data pipelines, PWAs, and authentication.

## 🛠️ Tech Stack

<div align="center">
  <a href="https://nextjs.org/" target="_blank"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="NextJS"></a>
  <a href="https://react.dev/" target="_blank"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com/" target="_blank"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS"></a>
  <a href="https://cloud.google.com/vertex-ai/docs/generative-ai/gemini/gemini-api" target="_blank"><img src="https://img.shields.io/badge/Google_Gemini-8A2BE2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Google Gemini"></a>
  <a href="https://sdk.vercel.ai/" target="_blank"><img src="https://img.shields.io/badge/Vercel_AI_SDK-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel AI SDK"></a>
  <a href="https://pollinations.ai/" target="_blank"><img src="https://img.shields.io/badge/Pollinations.ai-8A2BE2?style=for-the-badge&logo=ai&logoColor=white" alt="Pollinations.ai"></a>
  <a href="https://orm.drizzle.team/" target="_blank"><img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge" alt="Drizzle ORM"></a>
  <a href="https://supabase.com/" target="_blank"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://www.postgresql.org/" target="_blank"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"></a>
  <a href="https://www.radix-ui.com/" target="_blank"><img src="https://img.shields.io/badge/Radix_UI-111827?style=for-the-badge&logo=radix-ui&logoColor=white" alt="Radix UI"></a>
  <a href="https://www.framer.com/motion/" target="_blank"><img src="https://img.shields.io/badge/Framer_Motion-EF008F?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion"></a>
  <a href="https://web.dev/progressive-web-apps/" target="_blank"><img src="https://img.shields.io/badge/PWA-4285F4?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA"></a>
  <a href="https://cloudinary.com/" target="_blank"><img src="https://img.shields.io/badge/Cloudinary-3448C6?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary"></a>
  <a href="https://formspree.io/" target="_blank"><img src="https://img.shields.io/badge/Formspree-FF6C6C?style=for-the-badge&logo=formspree&logoColor=white" alt="Formspree"></a>
  <a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"></a>
  <a href="https://www.npmjs.com/" target="_blank"><img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm"></a>
  <a href="https://eslint.org/" target="_blank"><img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint"></a>
  <a href="https://prettier.io/" target="_blank"><img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black" alt="Prettier"></a>
  <a href="https://vercel.com/" target="_blank"><img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"></a>
</div>

## 🏗️ Technical Architecture

Mindhouse uses a layered architecture with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│   (React Components + Next.js App Router + Tailwind)    │
├─────────────────────────────────────────────────────────┤
│                  Business Logic Layer                   │
│           (API Routes + Client-side Services)           │
├─────────────────────────────────────────────────────────┤
│                        AI Layer                         │
│    (Vercel AI SDK · Gemini / OpenAI · Pollinations)     │
├─────────────────────────────────────────────────────────┤
│                    Data Access Layer                    │
│         (Drizzle ORM  +  Supabase Client / RLS)         │
├─────────────────────────────────────────────────────────┤
│                     Database Layer                      │
│      (PostgreSQL via Supabase  +  IndexedDB Cache)      │
└─────────────────────────────────────────────────────────┘
```

- **Frontend:** Next.js 15 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS + Radix UI Primitives + Framer Motion
- **AI:** Vercel AI SDK with Google Gemini / OpenAI (bring-your-own-key); Pollinations.ai for image generation
- **Data:** PostgreSQL (Supabase) via Drizzle ORM on server routes; Supabase client (RLS) for subjects & questions; IndexedDB (localforage) as local cache
- **Data Isolation:** Supabase Row Level Security (RLS) policies protect user data accessed through the Supabase client. Server routes that use Drizzle ORM enforce user ownership at the application layer.

## 📚 Technical Documentation

Explore detailed design specifications and integration plans:

- 📖 **[AI Question Generation Guide](docs/AI_QUESTION_GENERATION.md)** - Workflow details for Gemini question generation pipelines.
- 🚀 **[AI Deployment Guide](docs/AI_DEPLOYMENT_GUIDE.md)** - Production settings and API integrations.
- 🔧 **[Environment Setup](docs/ENVIRONMENT_SETUP.md)** - Guide to local environment variables.
- 🗄️ **[Supabase Storage Setup](docs/STORAGE-SETUP-GUIDE.md)** - Cloud storage bucket rules and asset configurations.
- ⚡ **[Edge Functions Setup](docs/EDGE_FUNCTIONS_SETUP.md)** - Serverless function deployments.
- 🎯 **[Project Blueprint](docs/BLUEPRINT.md)** - Platform blueprint and UI style guidelines.
- 📊 **[Technical Analysis](docs/TECHNICAL-ANALYSIS.md)** - Code structure, repository patterns, and architecture audits.

## 🚀 Quick Start - AI Service

Set up local AI-powered generation modules in minutes:

1. **Get a Google AI API Key:**
   - Generate your API key at [Google AI Studio](https://aistudio.google.com/)

2. **Configure your Environment:**
   - Create a `.env.local` file in the project root:

   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Install and Run:**

   ```bash
   npm install
   npm run dev
   ```

4. **Verify Generation:**
   - Navigate to `/question-manager`, click **"Generate Questions with AI"**, select a subject, and click generate.

<details>
<summary><b>🗺️ High-Level System Architecture (Mermaid Diagram)</b></summary>
<br>

```mermaid
flowchart TD
  subgraph UI["Presentation (Next.js App Router)"]
    Dashboard
    Quiz
    Flashcard
    SubjectManager
    QuestionManager
    AIChat
    VoiceAssistant
    AnalyticsDashboard
    ProfileSettings
    DataManagement
  end

  subgraph API["API Routes / Services"]
    QuizAPI["/api/quiz + /api/results"]
    AnalyticsAPI["/api/analytics/*"]
    FlashcardAPI["/api/flashcards"]
    AIChatAPI["/api/ai-chat"]
    AIGenAPI["/api/ai-generate-*"]
    ImageAPI["Image Generation API"]
    AvatarAPI["/api/upload-avatar"]
  end

  subgraph AILayer["AI Layer"]
    VercelAISDK["Vercel AI SDK"]
    Gemini["Google Gemini"]
    OpenAI["OpenAI (BYOK)"]
    Pollinations["Pollinations.ai"]
  end

  subgraph DAL["Data Access"]
    SupabaseClient["Supabase Client (RLS)"]
    Drizzle["Drizzle ORM"]
  end

  subgraph StorageLayer["Storage"]
    Postgres[("PostgreSQL / Supabase")]
    IndexedDB[("IndexedDB Cache")]
  end

  subgraph Cloud
    Cloudinary
    SupabaseAuth["Supabase Auth"]
  end

  %% Direct Supabase-client channel (subjects & questions)
  SubjectManager --> SupabaseClient
  QuestionManager --> SupabaseClient
  SupabaseClient --> Postgres

  %% API-route channel (Drizzle ORM)
  Quiz --> QuizAPI
  Dashboard --> AnalyticsAPI
  AnalyticsDashboard --> AnalyticsAPI
  Flashcard --> FlashcardAPI
  AIChat --> AIChatAPI
  QuizAPI --> Drizzle
  AnalyticsAPI --> Drizzle
  FlashcardAPI --> Drizzle
  AIChatAPI --> Drizzle
  Drizzle --> Postgres

  %% AI generation
  QuestionManager --> AIGenAPI
  SubjectManager --> AIGenAPI
  AIGenAPI --> VercelAISDK
  VercelAISDK --> Gemini
  VercelAISDK --> OpenAI
  Flashcard --> ImageAPI
  ImageAPI --> Pollinations

  %% Local cache & voice
  AIChat --> IndexedDB
  Quiz --> VoiceAssistant
  Flashcard --> VoiceAssistant
  Quiz --> AIChat

  %% Cloud services
  ProfileSettings --> AvatarAPI
  AvatarAPI --> Cloudinary
  ProfileSettings --> SupabaseAuth
  DataManagement --> SupabaseAuth
```

</details>

<details>
<summary><b>📦 Detailed Installation Guide</b></summary>
<br>

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/neurodivergent-dev/Mindhouse.git
   cd Mindhouse
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Populate Environment Variables (`.env.local`):**

   ```ini
   # AI Settings
   GEMINI_API_KEY=your_gemini_api_key

   # Supabase Client Settings
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Database (Drizzle ORM)
   DATABASE_URL=your_pooled_postgres_url   # Supabase pooler, port 6543
   DIRECT_URL=your_direct_postgres_url     # Direct connection, port 5432 (used by migrations)

   # Cloudinary configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret

   # Settings
   NEXT_PUBLIC_DEMO_MODE=false
   ```

4. **Initialize DB Schemas:**

   ```bash
   npm run db:generate
   npm run db:init
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```

</details>

<details>
<summary><b>🗄️ Database Management CLI Commands</b></summary>
<br>

- **Generate Migration Scripts:**
  ```bash
  npm run db:generate
  ```
- **Apply Migrations to Target DB:**
  ```bash
  npm run db:migrate
  ```
- **Launch Drizzle Studio GUI:**
  ```bash
  npm run db:studio
  ```

</details>

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository.
2. Create a **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3. **Commit** your modifications (`git commit -m 'Add some AmazingFeature'`).
4. **Push** your branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

---

<div align="center">
  <p><strong>Mindhouse</strong> - Where knowledge meets intelligence.</p>
</div>
