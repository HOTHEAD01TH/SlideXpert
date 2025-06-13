# SlideXpert - AI-Powered Presentation Generator

SlideXpert is a modern web application that leverages AI to transform text prompts into professional PowerPoint presentations. Built with Next.js and powered by advanced AI technology, it streamlines the presentation creation process.

<!-- GitAds-Verify: XMZKHLFSYTLHC4GBDFAUKGK2QBPTUN1E -->
## GitAds Sponsored
[![Sponsored by GitAds](https://gitads.dev/v1/ad-serve?source=hothead01th/slidexpert@github)](https://gitads.dev/v1/ad-track?source=hothead01th/slidexpert@github)


## Features

- **AI-Powered Generation**: Create professional presentations instantly using advanced AI technology
- **Downloadable PPT**: Export your presentations in PowerPoint format
- **Presentation History**: Access all your previously generated presentations
- **Cloud Storage**: Automatically save and access presentations from any device
- **Custom Settings**: Control slide count, style preferences, and generation parameters
- **Google Authentication**: Easily sign in with your Google account
- **Featured Slides**: Browse through example presentations for inspiration
- **Demo Presentations**: Download sample presentations to see the quality

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: Framer Motion, Tabler Icons, Shadcn UI
- **Backend**: Supabase
- **Authentication**: Next Auth with Supabase Adapter
- **Storage**: Supabase Storage
- **AI Integration**: Google Gemini API, Hugging Face API
- **Presentation Generation**: PPTX Gen JS

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see `.env.example` file)

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/public` - Static assets
- `/types` - TypeScript type definitions
- `/config` - Application configuration

## Deployment

The application is optimized for deployment on Vercel. For other platforms, ensure environment variables are properly configured.

## License

MIT License - feel free to use this project for your own purposes.
