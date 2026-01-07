"use client";

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { getAnalyticsPartFour } from '@/api/services/analytics';
import { logger } from '@/lib/default-logger';
import type { AnalyticsPartFour, CourseGroup, Quest } from '@/types/analytics/analytics-four';

export default function Page(): React.JSX.Element {
  const [analytics, setAnalytics] = React.useState<AnalyticsPartFour[]>([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>('');
  const [selectedQuestId, setSelectedQuestId] = React.useState<string>('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const fetchAnalytics = async (): Promise<void> => {
    try {
      const response = await getAnalyticsPartFour();
      setAnalytics(response);
    } catch (error: unknown) {
      logger.error('Failed to fetch attendance analytics', error);
    }
  };

  const selectedCourse = analytics.find(course => String(course.course_id) === selectedCourseId) || null;
  const selectedGroup = selectedCourse?.course_groups.find(group => String(group.group_id) === selectedGroupId) || null;
  const selectedQuest = selectedGroup?.quests.find(quest => String(quest.quest_id) === selectedQuestId) || null;

  const handleCourseChange = (event: SelectChangeEvent): void => {
    setSelectedCourseId(event.target.value);
    setSelectedGroupId('');
    setSelectedQuestId('');
    setPage(0);
  };

  const handleGroupChange = (event: SelectChangeEvent): void => {
    setSelectedGroupId(event.target.value);
    setSelectedQuestId('');
    setPage(0);
  };

  const handleQuestChange = (event: SelectChangeEvent): void => {
    setSelectedQuestId(event.target.value);
    setPage(0);
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  React.useEffect(() => {
    fetchAnalytics().catch((error: unknown) => {
      logger.error('Failed to fetch attendance analytics', error);
    });
  }, []);

  React.useEffect(() => {
    if (analytics.length && !selectedCourseId) {
      setSelectedCourseId(String(analytics[0]?.course_id));
    }
  }, [analytics, selectedCourseId]);

  React.useEffect(() => {
    if (selectedCourse?.course_groups.length && !selectedGroupId) {
      setSelectedGroupId(String(selectedCourse.course_groups[0]?.group_id));
    }
  }, [selectedCourse, selectedGroupId]);

  React.useEffect(() => {
    if (selectedGroup?.quests.length && !selectedQuestId) {
      setSelectedQuestId(String(selectedGroup.quests[0]?.quest_id));
    }
  }, [selectedGroup, selectedQuestId]);

  const students = selectedQuest?.students_progress ?? [];
  const pagedStudents = students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Attendance Tracking</Typography>
        <Typography variant="body2" color="text.secondary">
          Filter by course, group, and quest to view student attendance status.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={4} xs={12}>
              <FormControl fullWidth>
                <FormLabel htmlFor="course-select">Course</FormLabel>
                <Select
                  id="course-select"
                  value={selectedCourseId}
                  onChange={handleCourseChange}
                  size="small"
                >
                  {analytics.map(course => (
                    <MenuItem key={course.course_id} value={String(course.course_id)}>
                      {`${course.course_code} ${course.course_name}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid md={4} xs={12}>
              <FormControl fullWidth>
                <FormLabel htmlFor="group-select">Course Group</FormLabel>
                <Select
                  id="group-select"
                  value={selectedGroupId}
                  onChange={handleGroupChange}
                  size="small"
                  disabled={!selectedCourse}
                >
                  {(selectedCourse?.course_groups ?? []).map((group: CourseGroup) => (
                    <MenuItem key={group.group_id} value={String(group.group_id)}>
                      {group.group_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid md={4} xs={12}>
              <FormControl fullWidth>
                <FormLabel htmlFor="quest-select">Quest</FormLabel>
                <Select
                  id="quest-select"
                  value={selectedQuestId}
                  onChange={handleQuestChange}
                  size="small"
                  disabled={!selectedGroup}
                >
                  {(selectedGroup?.quests ?? []).map((quest: Quest) => (
                    <MenuItem key={quest.quest_id} value={String(quest.quest_id)}>
                      {quest.quest_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Attendance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedStudents.length ? (
                pagedStudents.map((student) => {
                  const isPresent = student.highest_score !== null;
                  return (
                    <TableRow hover key={student.username}>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>
                        <Chip
                          label={isPresent ? 'Present' : 'Absent'}
                          color={isPresent ? 'success' : 'default'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="body2" color="text.secondary">
                      No attendance data available for the selected filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={students.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
    </Stack>
  );
}
