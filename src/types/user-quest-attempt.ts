import type { EduquestUser } from './eduquest-user';
import type {Quest, QuestSummary} from './quest';

export interface UserQuestAttempt {
  student_id: EduquestUser['id']
  quest_id: Quest['id']
  id: number
  first_attempted_date: string | null // ISO 8601 datetime string
  last_attempted_date: string | null// ISO 8601 datetime string
  time_taken: number
  total_score_achieved: number
  bonus_points?: number
  bonus_awarded?: boolean
  submitted: boolean
}

export interface UserQuestAttemptSummary {
  student_id: EduquestUser['id']
  quest: QuestSummary
  id: number
  time_taken: number
  total_score_achieved: number
  bonus_points?: number
  bonus_awarded?: boolean
  submitted: boolean
}

export interface UserQuestAttemptBonusResponse {
  bonus_awarded: boolean
  bonus_points: number
}

export interface UserQuestAttemptNewForm {
  student_id: EduquestUser['id']
  quest_id: Quest['id']
  first_attempted_date: string
}

export interface UserQuestAttemptUpdateForm {
  submitted?: boolean
  last_attempted_date: string,
  student_id: EduquestUser['id'],
  quest_id: Quest['id'],
}

export interface UserQuestAttemptMultipleUpdateForm {
  id: number
  submitted: boolean
}
