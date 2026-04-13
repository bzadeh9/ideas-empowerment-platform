import { type GatewayModelId } from '@ai-sdk/gateway'

export enum Models {
  AnthropicClaudeOpus46 = 'anthropic/claude-opus-4.6',
  AnthropicClaudeSonnet46 = 'anthropic/claude-sonnet-4.6',
  OpenAIGPT53Codex = 'openai/gpt-5.3-codex',
  XaiGrok41Reasoning = 'xai/grok-4.1-fast-reasoning',
}

export const DEFAULT_MODEL = Models.AnthropicClaudeOpus46

export const SUPPORTED_MODELS: GatewayModelId[] = [
  Models.AnthropicClaudeOpus46,
  Models.AnthropicClaudeSonnet46,
  Models.OpenAIGPT53Codex,
  Models.XaiGrok41Reasoning,
]

export const MODEL_NAMES: Record<string, string> = {
  [Models.AnthropicClaudeOpus46]: 'Claude Opus 4.6',
  [Models.AnthropicClaudeSonnet46]: 'Claude Sonnet 4.6',
  [Models.OpenAIGPT53Codex]: 'GPT-5.3 Codex',
  [Models.XaiGrok41Reasoning]: 'Grok 4.1 Reasoning',
}

export interface TestPrompt {
  id: string
  category: string
  title: string
  prompt: string
  description: string
}

export const TEST_PROMPTS: TestPrompt[] = [
  {
    id: 'internal-dashboard',
    category: 'Internal Dashboard',
    title: 'Team Analytics Dashboard',
    prompt:
      'Generate a Next.js dashboard with charts showing team productivity metrics, task completion rates, and sprint velocity using Recharts',
    description:
      'A real-time analytics dashboard for tracking team performance and project metrics.',
  },
  {
    id: 'customer-portal',
    category: 'Customer Portal',
    title: 'Customer Support Portal',
    prompt:
      'Create a Next.js customer support portal with ticket submission, status tracking, FAQ search, and live chat widget',
    description:
      'A self-service portal where customers can submit and track support tickets.',
  },
  {
    id: 'data-viz',
    category: 'Data Visualization',
    title: 'Interactive Data Explorer',
    prompt:
      'Build a React data visualization app that loads CSV files and renders interactive bar charts, line graphs, and pie charts with filtering',
    description:
      'An interactive tool for uploading datasets and exploring them with rich visualizations.',
  },
  {
    id: 'workflow-automation',
    category: 'Workflow Automation',
    title: 'Approval Workflow Engine',
    prompt:
      'Create a Next.js app for multi-step approval workflows with role-based routing, email notifications, and audit logging',
    description:
      'A configurable workflow engine for managing multi-step approval processes.',
  },
  {
    id: 'landing-page',
    category: 'Landing Page',
    title: 'SaaS Landing Page',
    prompt:
      'Generate a modern SaaS landing page with hero section, feature grid, pricing table, testimonials carousel, and contact form',
    description:
      'A conversion-optimized landing page for a SaaS product with responsive design.',
  },
  {
    id: 'api-service',
    category: 'API Service',
    title: 'REST API with Auth',
    prompt:
      'Create a Node.js Express REST API with JWT authentication, CRUD endpoints for a task manager, input validation, and Swagger docs',
    description:
      'A production-ready REST API service with authentication and documentation.',
  },
  {
    id: 'mobile-app',
    category: 'Mobile App',
    title: 'Fitness Tracker App',
    prompt:
      'Build a React Native fitness tracker app with workout logging, progress charts, goal setting, and daily reminders',
    description:
      'A cross-platform mobile app for tracking workouts and fitness goals.',
  },
  {
    id: 'chatbot',
    category: 'Chatbot',
    title: 'AI Knowledge Base Chatbot',
    prompt:
      'Create a Next.js chatbot interface that answers questions from a knowledge base using AI, with conversation history and source citations',
    description:
      'An AI-powered chatbot that provides answers from a curated knowledge base.',
  },
]
