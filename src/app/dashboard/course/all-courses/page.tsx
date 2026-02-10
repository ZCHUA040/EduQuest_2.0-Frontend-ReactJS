// page.tsx

"use client";

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { XCircle as XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import type { Course } from '@/types/course';
import { getNonPrivateCourses } from "@/api/services/course";
import { logger } from '@/lib/default-logger';
import { CourseNewForm } from "@/components/dashboard/course/course-new-form";
import { CourseCard } from "@/components/dashboard/course/course-card";
import { SkeletonCourseCard } from "@/components/dashboard/skeleton/skeleton-course-card";
import { useUser } from "@/hooks/use-user";

export default function Page(): React.JSX.Element {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const { eduquestUser } = useUser();

  const toggleForm = (): void => {
    setShowForm(!showForm);
  };

  const fetchCourses = async (): Promise<void> => {
    setLoading(true);
    try {
      const data: Course[] = await getNonPrivateCourses();
      setCourses(data);
      logger.debug('Filtered Courses', data);
    } catch (error: unknown) {
      // Since errors are already handled in the interceptor,
      // you can display a generic error message or handle specific cases if needed.
      logger.error('Failed to fetch courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreateSuccess = async (): Promise<void> => {
    await fetchCourses();
    setShowForm(false);
  };

  React.useEffect(() => {
    fetchCourses().catch((error: unknown) => {
      // This catch is optional since errors are handled in the service
      logger.error('Unexpected error while fetching courses', error);
    });
  }, []);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
        <Stack spacing={1}>
          <Typography variant="h4">All Courses</Typography>
          <Typography variant="body2" color="text.secondary">
            List of all courses available on the platform.
          </Typography>
        </Stack>
        {eduquestUser?.is_staff ? <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Button
              startIcon={showForm ? <XCircleIcon fontSize="var(--icon-fontSize-md)" /> : <PlusIcon fontSize="var(--icon-fontSize-md)" />}
              variant={showForm ? 'text' : 'contained'}
              color={showForm ? 'error' : 'primary'}
              onClick={toggleForm}
            >
              {showForm ? 'Cancel' : 'Create'}
            </Button>
          </Stack> : null}
      </Stack>
      {showForm ? <CourseNewForm onFormSubmitSuccess={handleCourseCreateSuccess} /> : null}
      {loading ? (
        <SkeletonCourseCard />
      ) : courses.length === 0 ? (
        <Typography variant="h6" align="center" mt={4}>
          No data available.
        </Typography>
      ) : (
        <CourseCard rows={courses}/>
      )}
    </Stack>
  );
}
