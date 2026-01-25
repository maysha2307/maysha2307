export interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  date: string; // Format: YYYY-MM-DD
  emoji: string; // e.g., "💍", "🎂", "💕"
  order: number;
}
