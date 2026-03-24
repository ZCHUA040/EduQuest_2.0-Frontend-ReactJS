export interface EduquestUser extends EduquestUserSummary {
  first_name: string;
  last_name: string;
  username: string;
  last_login: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
  is_superuser: boolean;
  is_active: boolean;
  is_staff: boolean;
  total_points: number;
  daily_checkin_streak: number;
  daily_checkin_longest_streak: number;
  daily_checkin_last_date: string | null;
}

export interface EduquestUserSummary {
  id: number;
  email: string;
  nickname: string;
}

export interface EduquestUserUpdateForm {
  nickname: string;
}

export interface DailyCheckInResult {
  checked_in: boolean;
  already_checked_in: boolean;
  daily_points_awarded: number;
  streak_bonus_awarded: number;
  current_streak: number;
  longest_streak: number;
  total_points: number;
}
