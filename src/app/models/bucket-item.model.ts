export type BucketCategory = 'travel' | 'adventure' | 'milestone' | 'date-idea' | 'life-goal';

export interface BucketItem {
  id: string;
  title: string;
  description?: string;
  category: BucketCategory;
  isCompleted: boolean;
  completedDate?: string;
  completedNote?: string;
  createdAt: string;
  emoji?: string;
}

export const BUCKET_CATEGORIES: { id: BucketCategory; name: string; emoji: string }[] = [
  { id: 'travel', name: 'Travel', emoji: '✈️' },
  { id: 'adventure', name: 'Adventures', emoji: '🎢' },
  { id: 'milestone', name: 'Milestones', emoji: '💍' },
  { id: 'date-idea', name: 'Date Ideas', emoji: '🌹' },
  { id: 'life-goal', name: 'Life Goals', emoji: '🏠' }
];
