export interface StudentTutorialAttemptRow {
  id: number
  email: string
  username: string
  total_points: number
  course_group_ids: number[]
  tutorial_attempted: number
  tutorial_total: number
  tutorial_percentage: number
}
