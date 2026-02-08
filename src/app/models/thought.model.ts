export interface Thought {
  id: number;
  text: string;
  reply?: string;
  order: number;
  liked?: boolean;
  replyLiked?: boolean;
  author?: string; // 'm' or 'a' or empty
}
