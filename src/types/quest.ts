import type {Image} from "@/types/image";
import type {CourseGroup, CourseGroupSummary} from "@/types/course-group";
import type {EduquestUserSummary, EduquestUser} from "@/types/eduquest-user";
import type {Document} from "@/types/document";


export interface Quest {
  course_group: CourseGroup;
  organiser: EduquestUserSummary;
  image: Image;
  source_document?: Document | null;
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  tutorial_date: string | null // ISO 8601 datetime string
  expiration_date: string | null;
  max_attempts: number;
  total_max_score: number;
  total_questions: number;
}

export interface QuestSummary {
  course_group: CourseGroupSummary;
  id: number;
  name: string;
}

export interface QuestNewForm {
  course_group_id: CourseGroup['id'];
  organiser_id: EduquestUser['id'];
  image_id: Image['id'];
  source_document_id?: Document['id'] | null;
  name: string;
  description: string;
  type: string;
  status: string;
  expiration_date: string | null;
  tutorial_date?: string | null;
  max_attempts: number;
}

export interface QuestUpdateForm {
  course_group_id?: CourseGroup['id'];
  image_id?: Image['id'];
  source_document_id?: Document['id'] | null;
  name?: string;
  description?: string;
  type?: string;
  status?: string;
  expiration_date?: string | null;
  tutorial_date?: string | null;
  max_attempts?: number;
}
