import apiService from "@/api/api-service";
import {type AnalyticsPartOne} from "@/types/analytics/analytics-one";
import {type AnalyticsPartTwo} from "@/types/analytics/analytics-two";
import {type AnalyticsPartThree} from "@/types/analytics/analytics-three";
import {type AnalyticsPartFour} from "@/types/analytics/analytics-four";
import {type StudentTutorialAttemptRow} from "@/types/analytics/student-tutorial-attempt";
import type {TutorialSessionColumn} from "@/components/dashboard/insights/student/student-table";

interface StudentAttendanceColumnsRawResponse {
  columns: { quest_id: number; course_group_id: number; label: string }[];
  attendance_keys: string[];
}

export interface StudentAttendanceColumnsResponse {
  columns: TutorialSessionColumn[];
  attendance_keys: string[];
}

export const getAnalyticsPartOne = async (): Promise<AnalyticsPartOne> => {
  const response = await apiService.get<AnalyticsPartOne>('/api/analytics/part-one/');
  return response.data;
}

export const getAnalyticsPartTwo = async (userId: number, option: string): Promise<AnalyticsPartTwo> => {
  const response = await apiService.get<AnalyticsPartTwo>(`/api/analytics/part-two/?user_id=${userId.toString()}&option=${option}`);
  return response.data;
}

export const getAnalyticsPartThree = async (): Promise<AnalyticsPartThree> => {
  const response = await apiService.get<AnalyticsPartThree>('/api/analytics/part-three/');
  return response.data;
}

export const getAnalyticsPartFour = async (): Promise<AnalyticsPartFour[]> => {
  const response = await apiService.get<AnalyticsPartFour[]>('/api/analytics/part-four/');
  return response.data;
}

export const getStudentTutorialAttemptInsights = async (courseId: number, courseGroupId?: number): Promise<StudentTutorialAttemptRow[]> => {
  const params = new URLSearchParams({ course_id: courseId.toString() });
  if (courseGroupId) {
    params.set('course_group_id', courseGroupId.toString());
  }
  const response = await apiService.get<StudentTutorialAttemptRow[]>(`/api/analytics/student-tutorial-attempts/?${params.toString()}`);
  return response.data;
}

export const getStudentAttendanceColumns = async (courseId: number, courseGroupId?: number): Promise<StudentAttendanceColumnsResponse> => {
  const params = new URLSearchParams({ course_id: courseId.toString() });
  if (courseGroupId) {
    params.set('course_group_id', courseGroupId.toString());
  }
  const response = await apiService.get<StudentAttendanceColumnsRawResponse>(`/api/analytics/student-attendance-columns/?${params.toString()}`);
  return {
    columns: response.data.columns.map((column) => ({
      questId: column.quest_id,
      courseGroupId: column.course_group_id,
      label: column.label
    })),
    attendance_keys: response.data.attendance_keys
  };
}

export const exportStudentAttendanceWorkbook = async (courseId: number, courseGroupId?: number): Promise<Blob> => {
  const params = new URLSearchParams({ course_id: courseId.toString() });
  if (courseGroupId) {
    params.set('course_group_id', courseGroupId.toString());
  }
  const response = await apiService.get(`/api/analytics/student-attendance-workbook/?${params.toString()}`, {
    responseType: 'blob'
  });
  return response.data as Blob;
}

export const updateStudentAttendanceOverride = async (
  studentId: number,
  questId: number,
  isPresent: boolean
): Promise<void> => {
  await apiService.post('/api/analytics/student-attendance-override/', {
    student_id: studentId,
    quest_id: questId,
    is_present: isPresent
  });
}
