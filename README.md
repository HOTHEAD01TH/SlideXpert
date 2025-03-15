# SlideXpert - AI-Powered Presentation Generator

SlideXpert is a modern web application that leverages AI to transform text prompts into professional PowerPoint presentations. Built with Next.js and powered by advanced AI technology, it streamlines the presentation creation process.

## Features

- **AI-Powered Generation**: Create professional presentations instantly using advanced AI technology
- **Free to Use**: Get started with basic features including up to 5 slides per presentation
- **Downloadable PPT**: Export your presentations in PowerPoint format
- **Presentation History**: Access all your previously generated presentations
- **Cloud Storage**: Automatically save and access presentations from any device
- **Custom Settings**: Control slide count, style preferences, and generation parameters

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: Framer Motion, Tabler Icons
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Presentation Generation**: PPTX Gen JS

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

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

## Deployment

The application is optimized for deployment on Vercel. For other platforms, ensure environment variables are properly configured.

## License

MIT License - feel free to use this project for your own purposes.
