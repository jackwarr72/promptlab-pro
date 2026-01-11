
export interface GeneratedPrompt {
  id: string;
  topic: string;
  content: string;
  timestamp: number;
}

export enum PromptStyle {
  STRUCTURED = 'Structured (CO-STAR)',
  CREATIVE = 'Creative & Flowy',
  CONCISE = 'Short & Direct',
  ACADEMIC = 'Academic & Rigorous'
}
