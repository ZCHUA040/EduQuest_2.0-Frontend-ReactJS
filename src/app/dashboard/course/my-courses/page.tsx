"use client"
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Course } from '@/types/course';
import { logger } from '@/lib/default-logger'
import { CourseCard } from "@/components/dashboard/course/course-card";
import { SkeletonCourseCard } from "@/components/dashboard/skeleton/skeleton-course-card";
import { useUser } from '@/hooks/use-user';
import {getMyCourses} from "@/api/services/course";


export default function Page(): React.JSX.Element {
  const { eduquestUser } = useUser();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchMyCourses = React.useCallback(async (): Promise<void> => {
    if (eduquestUser) {
      try {
        const response = await getMyCourses(eduquestUser.id.toString());
        setCourses(response);
      } catch (error: unknown) {
        logger.error('Failed to fetch courses', error);
      } finally {
        setLoading(false);
      }
    }
  }, [eduquestUser]);

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchMyCourses();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, [fetchMyCourses]);


  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">My Courses</Typography>
          <Typography variant="body2" color="text.secondary">List of courses you are enrolled in.</Typography>
        </Stack>

      </Stack>
      {loading ? (
        <SkeletonCourseCard />
      ) : (
        courses.length === 0 ? (
            <Typography variant="h6" align="center" mt={4}>No data available.</Typography>
          ) :
        <CourseCard rows={courses} />
      )}
    </Stack>
  );
}
