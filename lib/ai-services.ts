import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface SlideContent {
  title: string;
  content: string;
  imagePrompt?: string;
  imageUrl?: string;
}

export async function generatePresentationContent(prompt: string): Promise<SlideContent[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const structuredPrompt = `Create a presentation outline for: ${prompt}
    Format as JSON array with slides containing:
    - title
    - content
    - imagePrompt (description for generating relevant image)
    Maximum 8 slides.`;

  const result = await model.generateContent(structuredPrompt);
  const response = await result.response;
  const slides = JSON.parse(response.text());
  
  return slides;
} 