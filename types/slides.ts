export type Slide = {
  title: string
  content: string
  imagePrompt?: string
  imageUrl?: string
}

export interface Presentation {
  id?: number;
  user_id: string;
  prompt: string;
  slides: Slide[];
  created_at?: string;
} 