# Ideas Empowerment Platform

An end-to-end coding platform that empowers individuals and businesses to turn innovative ideas into working Proof of Concept (PoC) and Prototype solutions. Users enter text prompts, and an AI agent generates full-stack applications in a sandboxed environment with live preview, file explorer, and command logs.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-description=A+full-stack+coding+platform+built+with+Vercel%27s+AI+Cloud%2C+AI+SDK%2C+and+Next.js.&demo-image=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fv1754588832%2FOSSvibecodingplatform%2Fscreenshot.png&demo-title=Vibe+Coding+Platform&demo-url=https%3A%2F%2Fvercel.fyi%2Fvibes&project-name=Vibe+Coding+Platform&repository-name=vibe-coding-platform&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fexamples%2Ftree%2Fmain%2Fapps%2Fvibe-coding-platform&from=vibe-coding-platform-app)

---

## Why This Platform?

### For Individuals

This platform enables anyone within a business to develop Proof of Concept (PoC) or Prototype solutions for their innovative ideas. By describing an idea in plain language, users can quickly see how it could be implemented — no deep technical expertise required. This lowers the barrier from "I have an idea" to "here's a working demo."

### For Businesses

Companies gain a platform that empowers staff at every level to contribute ideas directly, fostering a culture of innovation and engagement. Instead of ideas getting lost in suggestion boxes, employees can produce tangible prototypes that demonstrate real value — benefiting the whole organization.

### How It Works

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│  User enters │       │  AI agent    │       │  Live preview &  │
│  a text      │──────▶│  generates   │──────▶│  sandboxed app   │
│  prompt      │       │  full-stack  │       │  ready to share  │
│              │       │  application │       │  or deploy       │
└──────────────┘       └──────────────┘       └──────────────────┘
```

---

## Features

- **Multi-model AI support** via AI Gateway (Claude, GPT, Grok)
- **Secure code execution** with Vercel Sandbox
- **Real-time live preview** of generated applications
- **File explorer** for browsing project files
- **Command logs and error monitoring** for full visibility
- **One-click deploy** to Vercel and other hosting providers

---

## AI Integration

The platform seamlessly integrates with leading AI tools to accelerate ideation and creation:

| AI Tool | Integration |
|---------|-------------|
| [AI SDK](https://ai-sdk.dev) | Core AI framework (v6) powering prompt-to-application generation |
| [GitHub Copilot](https://github.com/features/copilot) | Assists developers contributing to or extending this platform |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | Claude-powered coding agent for rapid prototyping |
| [Google AI tools](https://ai.google/) | Compatible via AI Gateway for model flexibility |

### Supported Models

The platform supports multiple AI models through the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway):

- **Claude Opus 4.6** — Anthropic's most capable model
- **Claude Sonnet 4.6** — Balanced performance and speed
- **GPT-5.3 Codex** — OpenAI's code-focused model
- **Grok 4.1 Reasoning** — xAI's reasoning model

To switch models, use the model selector in the platform UI or configure the default in `ai/constants.ts`.

---

## Deployment Integration

Ideas can be quickly hosted and validated in real environments, including customer-specific platforms:

| Provider | How to Deploy |
|----------|---------------|
| **Vercel** | Click the "Deploy with Vercel" button above, or run `vc deploy` from the CLI |
| **AWS** | Build the application (`pnpm run build`), then deploy using [AWS Amplify](https://aws.amazon.com/amplify/) or a container service like ECS/Fargate |
| **Google Cloud** | Deploy via [Google Cloud Run](https://cloud.google.com/run) or [App Engine](https://cloud.google.com/appengine) using the Docker-compatible build output |
| **Azure** | Use [Azure Static Web Apps](https://azure.microsoft.com/en-us/products/app-service/static) or [Azure App Service](https://azure.microsoft.com/en-us/products/app-service) for hosting |

For all providers, ensure the `AI_GATEWAY_API_KEY` environment variable is set (see `.env.example`).

---

## Branding & Customization

The platform is designed to align with your company's branding guidelines:

- **Theme tokens** — All colors, fonts, and spacing are defined as CSS custom properties in `app/globals.css`. Update these variables to match your brand palette.
- **Component library** — Built on [shadcn/ui](https://ui.shadcn.com) with [Tailwind CSS](https://tailwindcss.com), making it straightforward to customize component styles.
- **Layout & structure** — Modify `app/layout.tsx` to adjust metadata, logos, and overall page structure.
- **Configuration** — Component settings are managed in `components.json` for consistent theming across the UI.

---

## Tech Stack

- [Next.js](https://nextjs.org) with Turbopack
- [AI SDK](https://ai-sdk.dev) v6
- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
- [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 22.x
- [pnpm](https://pnpm.io) package manager

### Run Locally

```bash
# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and set your AI_GATEWAY_API_KEY

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy

Click the "Deploy with Vercel" button at the top of this README, or run:

```bash
vc deploy
```

---

## Contributing

Contributions are welcome! Whether you're fixing a bug, adding a feature, or improving documentation, feel free to open an issue or submit a pull request.

---

## License

See [LICENSE](LICENSE) for details.
