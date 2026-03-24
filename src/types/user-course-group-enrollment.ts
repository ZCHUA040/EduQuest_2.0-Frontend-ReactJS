import type { EduquestUserSummary } from './eduquest-user';
import type {CourseGroup, CourseGroupSummary} from "@/types/course-group";

export interface UserCourseGroupEnrollment {
  course_group: CourseGroup
  student_id: EduquestUserSummary['id']
  student?: EduquestUserSummary
  id: number
  enrolled_on: string
  completed_on: string | null
}

export interface UserCourseGroupEnrollmentSummary {
  course_group: CourseGroupSummary
  id: number
  student_id: EduquestUserSummary['id']
}

export interface UserCourseGroupEnrollmentNewForm {
  course_group_id: CourseGroup['id']
  student_id: EduquestUserSummary['id']
}

