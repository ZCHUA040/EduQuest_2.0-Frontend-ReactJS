export type BonusGame =
  | {
      game_type: 'matching';
      prompt: string;
      pairs: { left: string; right: string }[];
      hint?: string;
    }
  | {
      game_type: 'ordering';
      prompt: string;
      items: string[];
      answer_order: number[];
      hint?: string;
    };
