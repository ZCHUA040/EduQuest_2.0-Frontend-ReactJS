"use client"
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { logger } from '@/lib/default-logger'
import {StudentTable, type TutorialSessionColumn} from "@/components/dashboard/insights/student/student-table";
import Grid from "@mui/material/Unstable_Grid2";
import {CourseProgressCard} from "@/components/dashboard/overview/course-progress-card";
import {QuestScoresCard} from "@/components/dashboard/overview/quest-scores-card";
import {type AnalyticsPartTwo, type UserCourseProgression} from "@/types/analytics/analytics-two";
import {SkeletonMyCourseProgress} from "@/components/dashboard/skeleton/analytics/skeleton-my-course-progress";
import {
  exportStudentAttendanceWorkbook,
  getAnalyticsPartTwo,
  getStudentAttendanceColumns,
  getStudentTutorialAttemptInsights,
  updateStudentAttendanceOverride
} from "@/api/services/analytics";
import {getNonPrivateCourses} from "@/api/services/course";
import {getCourseGroupsByCourse} from "@/api/services/course-group";
import type { Course } from "@/types/course";
import type { CourseGroup } from "@/types/course-group";
import type { StudentTutorialAttemptRow } from "@/types/analytics/student-tutorial-attempt";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {useUser} from "@/hooks/use-user";
import Button from "@mui/material/Button";
import { DownloadSimple as DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr/DownloadSimple";

export default function Page(): React.JSX.Element {
  const { eduquestUser } = useUser();
  const [analyticsPartTwoLoading, setAnalyticsPartTwoLoading] = React.useState(false);
  const [analyticsPartTwo, setAnalyticsPartTwo] = React.useState<AnalyticsPartTwo>(
    {
      user_course_progression: [],
      user_badge_progression: []
    }
  );
  const [nullPrompt, setNullPrompt] = React.useState<string>('Select a user to view their course progress');
  const [userCourseProgression, setUserCourseProgression] = React.useState<UserCourseProgression | null>(null);
  const [studentRows, setStudentRows] = React.useState<StudentTutorialAttemptRow[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<StudentTutorialAttemptRow | null>(null);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [courseGroups, setCourseGroups] = React.useState<CourseGroup[]>([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState<number | ''>('');
  const [selectedCourseGroupId, setSelectedCourseGroupId] = React.useState<number | ''>('');
  const [tutorialSessionColumns, setTutorialSessionColumns] = React.useState<TutorialSessionColumn[]>([]);
  const [attendanceKeys, setAttendanceKeys] = React.useState<Set<string>>(new Set<string>());
  const [attendanceDialogOpen, setAttendanceDialogOpen] = React.useState(false);
  const [attendanceStudentId, setAttendanceStudentId] = React.useState<number | ''>('');
  const [attendanceQuestId, setAttendanceQuestId] = React.useState<number | ''>('');
  const [attendancePresent, setAttendancePresent] = React.useState<'present' | 'absent' | ''>('');
  const [attendanceSubmitting, setAttendanceSubmitting] = React.useState(false);
  const selectedAttendanceStudent = React.useMemo(
    () => studentRows.find((student) => student.id === attendanceStudentId) ?? null,
    [studentRows, attendanceStudentId]
  );
  const filteredTutorialSessionColumns = React.useMemo(() => {
    if (attendanceStudentId === '' || selectedCourseGroupId !== '') {
      return tutorialSessionColumns;
    }
    if (!selectedAttendanceStudent) {
      return [];
    }
    const allowedGroupIds = new Set(selectedAttendanceStudent.course_group_ids);
    return tutorialSessionColumns.filter((column) => allowedGroupIds.has(column.courseGroupId));
  }, [attendanceStudentId, selectedAttendanceStudent, selectedCourseGroupId, tutorialSessionColumns]);

  const handleCourseSelection = (aUserCourseProgression: UserCourseProgression): void => {
    setUserCourseProgression(aUserCourseProgression);
  };

  const handleUserSelection = async (userId: number): Promise<void> => {
    setAnalyticsPartTwoLoading(true);
    setUserCourseProgression(null);
    const user = studentRows.find((student) => student.id === userId) ?? null;
    setSelectedUser(user);
    await fetchAnalyticsPartTwo(userId);
  };

  const fetchCourses = async (): Promise<void> => {
    try {
      const response = await getNonPrivateCourses();
      setCourses(response);
    } catch (error: unknown) {
      logger.error('Failed to fetch courses', error);
    }
  };

  const fetchAnalyticsPartTwo = async (userId: number): Promise<void> => {
    try {
      const response = await getAnalyticsPartTwo(userId, 'course_progression');
      setAnalyticsPartTwo(response);
      if (response.user_course_progression.length === 0) {
        setNullPrompt('This user is not enrolled in any courses');
      }
    } catch (error: unknown) {
      logger.error('Error fetching analytics part two', error);
    } finally {
      setAnalyticsPartTwoLoading(false);
    }
  };

  const fetchCourseGroups = async (courseId: number): Promise<CourseGroup[]> => {
    try {
      const response = await getCourseGroupsByCourse(courseId.toString());
      setCourseGroups(response);
      return response;
    } catch (error: unknown) {
      logger.error('Failed to fetch course groups', error);
      setCourseGroups([]);
      return [];
    }
  };

  const fetchStudentInsights = async (courseId: number, courseGroupId?: number): Promise<void> => {
    try {
      const response = await getStudentTutorialAttemptInsights(courseId, courseGroupId);
      setStudentRows(response);
    } catch (error: unknown) {
      logger.error('Failed to fetch student insights', error);
      setStudentRows([]);
    }
  };

  const fetchTutorialSessionColumns = async (
    courseId: number,
    courseGroupId?: number
  ): Promise<void> => {
    try {
      const response = await getStudentAttendanceColumns(courseId, courseGroupId);
      setTutorialSessionColumns(response.columns);
      setAttendanceKeys(new Set<string>(response.attendance_keys));
    } catch (error: unknown) {
      logger.error('Failed to fetch tutorial session columns', error);
      setTutorialSessionColumns([]);
      setAttendanceKeys(new Set<string>());
    }
  };

  const handleExportWorkbook = async (): Promise<void> => {
    if (!selectedCourseId) {
      return;
    }

    try {
      const blob = await exportStudentAttendanceWorkbook(
        selectedCourseId,
        selectedCourseGroupId || undefined
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const courseLabel = courses.find((course) => course.id === selectedCourseId);
      const groupLabel = courseGroups.find((group) => group.id === selectedCourseGroupId);
      const filename = `student-insights-${courseLabel?.code || 'course'}-${groupLabel?.name || 'all-groups'}-attendance-record.xlsx`;
      link.href = url;
      link.setAttribute('download', filename.replace(/\s+/g, '_'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      logger.error('Failed to export attendance workbook', error);
    }
  };

  const resetAttendanceDialog = (): void => {
    setAttendanceStudentId('');
    setAttendanceQuestId('');
    setAttendancePresent('');
  };

  React.useEffect(() => {
    if (
      attendanceQuestId !== '' &&
      !filteredTutorialSessionColumns.some((column) => column.questId === attendanceQuestId)
    ) {
      setAttendanceQuestId('');
    }
  }, [attendanceQuestId, filteredTutorialSessionColumns]);

  const handleSubmitAttendanceOverride = async (): Promise<void> => {
    if (!selectedCourseId || !attendanceStudentId || !attendanceQuestId || attendancePresent === '') {
      return;
    }

    setAttendanceSubmitting(true);
    try {
      await updateStudentAttendanceOverride(
        attendanceStudentId,
        attendanceQuestId,
        attendancePresent === 'present'
      );
      await Promise.all([
        fetchStudentInsights(selectedCourseId, selectedCourseGroupId || undefined),
        fetchTutorialSessionColumns(selectedCourseId, selectedCourseGroupId || undefined)
      ]);
      setAttendanceDialogOpen(false);
      resetAttendanceDialog();
    } catch (error: unknown) {
      logger.error('Failed to update attendance override', error);
    } finally {
      setAttendanceSubmitting(false);
    }
  };

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchCourses();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, []);

  return (
    <Stack spacing={3}>
      <Stack spacing={1} justifyContent="space-between">
        <Typography variant="h4">Student Insights</Typography>
        <Typography variant="body2" color="text.secondary">The following table shows the list of students and their course progress.</Typography>
      </Stack>

      {!eduquestUser?.is_staff ? (
        <Typography variant="body2" color="text.secondary">Only staff users can view student insights.</Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <FormLabel htmlFor="student-insights-course">Course</FormLabel>
                <Select
                  id="student-insights-course"
                  value={selectedCourseId}
                  onChange={(event) => {
                    const value = event.target.value;
                    const nextCourseId = value === '' ? '' : Number(value);
                    setSelectedCourseId(nextCourseId);
                    setSelectedCourseGroupId('');
                    setStudentRows([]);
                    setSelectedUser(null);
                    setUserCourseProgression(null);
                    setAnalyticsPartTwo({
                      user_course_progression: [],
                      user_badge_progression: []
                    });
                    if (nextCourseId) {
                      void (async () => {
                        await fetchCourseGroups(nextCourseId);
                        await Promise.all([
                          fetchStudentInsights(nextCourseId),
                          fetchTutorialSessionColumns(nextCourseId)
                        ]);
                      })();
                    } else {
                      setCourseGroups([]);
                      setTutorialSessionColumns([]);
                      setAttendanceKeys(new Set<string>());
                    }
                    setAttendanceDialogOpen(false);
                    resetAttendanceDialog();
                  }}
                  size="small"
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select course</em>
                  </MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth disabled={!selectedCourseId}>
                <FormLabel htmlFor="student-insights-course-group">Course Group</FormLabel>
                <Select
                  id="student-insights-course-group"
                  value={selectedCourseGroupId}
                  onChange={(event) => {
                    const value = event.target.value;
                    const nextGroupId = value === '' ? '' : Number(value);
                    setSelectedCourseGroupId(nextGroupId);
                    if (selectedCourseId) {
                      void fetchStudentInsights(selectedCourseId, nextGroupId || undefined);
                      void fetchTutorialSessionColumns(selectedCourseId, nextGroupId || undefined);
                    }
                    setAttendanceDialogOpen(false);
                    resetAttendanceDialog();
                  }}
                  size="small"
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>All groups</em>
                  </MenuItem>
                  {courseGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  disabled={!selectedCourseId || studentRows.length === 0 || tutorialSessionColumns.length === 0}
                  onClick={() => { setAttendanceDialogOpen(true); }}
                >
                  Edit Attendance
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadSimpleIcon />}
                  disabled={!selectedCourseId || studentRows.length === 0}
                  onClick={() => { void handleExportWorkbook(); }}
                >
                  Export XLSX
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {selectedCourseId ? (
              <StudentTable
                rows={studentRows}
                handleUserSelection={handleUserSelection}
                tutorialSessionColumns={tutorialSessionColumns}
                attendanceKeys={attendanceKeys}
                showSessionColumns={selectedCourseGroupId !== ''}
              />
          ) : (
            <Typography variant="body2" color="text.secondary">Select a course to load students.</Typography>
          )}

          <Dialog
            open={attendanceDialogOpen}
            onClose={() => {
              if (!attendanceSubmitting) {
                setAttendanceDialogOpen(false);
              }
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Edit Student Attendance</DialogTitle>
            <DialogContent>
              <Stack spacing={2} pt={1}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="attendance-student">Student</FormLabel>
                  <Select
                    id="attendance-student"
                    value={attendanceStudentId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setAttendanceStudentId(value === '' ? '' : Number(value));
                      setAttendanceQuestId('');
                    }}
                    size="small"
                    displayEmpty
                    disabled={attendanceSubmitting}
                  >
                    <MenuItem value="">
                      <em>Select student</em>
                    </MenuItem>
                    {studentRows.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.username} ({student.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <FormLabel htmlFor="attendance-session">Tutorial Session</FormLabel>
                  <Select
                    id="attendance-session"
                    value={attendanceQuestId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setAttendanceQuestId(value === '' ? '' : Number(value));
                    }}
                    size="small"
                    displayEmpty
                    disabled={attendanceSubmitting}
                  >
                    <MenuItem value="">
                      <em>Select tutorial session</em>
                    </MenuItem>
                    {filteredTutorialSessionColumns.map((column) => (
                      <MenuItem key={`attendance_column_${column.questId.toString()}`} value={column.questId}>
                        {column.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <FormLabel htmlFor="attendance-status">Status</FormLabel>
                  <Select
                    id="attendance-status"
                    value={attendancePresent}
                    onChange={(event) => {
                      const value = event.target.value as 'present' | 'absent' | '';
                      setAttendancePresent(value);
                    }}
                    size="small"
                    displayEmpty
                    disabled={attendanceSubmitting}
                  >
                    <MenuItem value="">
                      <em>Select status</em>
                    </MenuItem>
                    <MenuItem value="present">Present (1)</MenuItem>
                    <MenuItem value="absent">Absent (0)</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => {
                  setAttendanceDialogOpen(false);
                  resetAttendanceDialog();
                }}
                disabled={attendanceSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => { void handleSubmitAttendanceOverride(); }}
                disabled={
                  attendanceSubmitting ||
                  attendanceStudentId === '' ||
                  attendanceQuestId === '' ||
                  attendancePresent === ''
                }
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {selectedUser ? <Typography variant="h5" pt={2}>{`${selectedUser.username}'s Progress`}</Typography> : null}

      <Grid container spacing={3}>
        <Grid md={6} xs={12}>
          { analyticsPartTwoLoading ?
            <SkeletonMyCourseProgress
              title="Student's Courses"
              tooltip="The progress of the courses that the selected student is enrolled in"
            /> :
            (analyticsPartTwo.user_course_progression ?
                <CourseProgressCard
                  userCourseProgression={analyticsPartTwo.user_course_progression}
                  handleOnClick={handleCourseSelection}
                  title="Student's Courses"
                  tooltip="The progress of the courses that the selected student is enrolled in"
                  nullPrompt={nullPrompt}
                  sx={{ height: '100%' }} /> : null
            )
          }
        </Grid>
        <Grid md={6} xs={12}>
          { analyticsPartTwo.user_course_progression ?
            <QuestScoresCard
              userCourseProgression={userCourseProgression}
              title="Student's Quest"
              prompt="Select a course to view the student's quest scores"
              tooltip="The highest score the student has achieved for each quest"
              chartAutoHeight={false}
            /> : null}
        </Grid>
      </Grid>
    </Stack>
  );
}
