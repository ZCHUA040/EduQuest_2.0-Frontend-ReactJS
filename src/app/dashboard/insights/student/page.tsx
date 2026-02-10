"use client"
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { EduquestUser } from '@/types/eduquest-user';
import { logger } from '@/lib/default-logger'
import {StudentTable} from "@/components/dashboard/insights/student/student-table";
import Grid from "@mui/material/Unstable_Grid2";
import {CourseProgressCard} from "@/components/dashboard/overview/course-progress-card";
import {QuestScoresCard} from "@/components/dashboard/overview/quest-scores-card";
import {type AnalyticsPartTwo, type UserCourseProgression} from "@/types/analytics/analytics-two";
import {SkeletonMyCourseProgress} from "@/components/dashboard/skeleton/analytics/skeleton-my-course-progress";
import {getAllEduquestUsers} from "@/api/services/eduquest-user";
import {getAnalyticsPartTwo} from "@/api/services/analytics";

export default function Page(): React.JSX.Element {
  const [analyticsPartTwoLoading, setAnalyticsPartTwoLoading] = React.useState(false);
  const [analyticsPartTwo, setAnalyticsPartTwo] = React.useState<AnalyticsPartTwo>(
    {
      user_course_progression: [],
      user_badge_progression: []
    }
  );
  const [nullPrompt, setNullPrompt] = React.useState<string>('Select a user to view their course progress');
  const [userCourseProgression, setUserCourseProgression] = React.useState<UserCourseProgression | null>(null);
  const [eduquestUsers, setEduquestUsers] = React.useState<EduquestUser[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<EduquestUser | null>(null);


  const handleCourseSelection = (aUserCourseProgression: UserCourseProgression): void => {
    setUserCourseProgression(aUserCourseProgression);
  }

  const handleUserSelection = async (userId: number): Promise<void> => {
    setAnalyticsPartTwoLoading(true);
    setUserCourseProgression(null);
    await fetchAnalyticsPartTwo(userId);
  }

  const fetchEduquestUsers = async (): Promise<void> => {
    try {
      const response = await getAllEduquestUsers()
      setEduquestUsers(response);
    } catch (error: unknown) {
      logger.error('Failed to fetch Eduquest users', error);
    }
  }

  const fetchAnalyticsPartTwo = async (userId: number): Promise<void> => {
    const user = eduquestUsers?.find((user) => user.id === userId) ?? null;
    setSelectedUser(user);
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
  }

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchEduquestUsers();
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

      <StudentTable rows={eduquestUsers} handleUserSelection={handleUserSelection}/>

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
