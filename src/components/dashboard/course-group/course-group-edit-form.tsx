"use client";

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { XCircle as XCircleIcon } from "@phosphor-icons/react/dist/ssr/XCircle";
import { FloppyDisk as FloppyDiskIcon } from "@phosphor-icons/react/dist/ssr/FloppyDisk";
import { logger } from "@/lib/default-logger";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { getAdminEduquestUsers } from "@/api/services/eduquest-user";
import { updateCourseGroup } from "@/api/services/course-group";
import type { CourseGroup, CourseGroupUpdateForm } from "@/types/course-group";
import type { EduquestUser } from "@/types/eduquest-user";

interface CourseGroupEditFormProps {
  courseGroup: CourseGroup;
  onCancel: () => void;
  onSuccess: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export function CourseGroupEditForm({ courseGroup, onCancel, onSuccess, onDelete }: CourseGroupEditFormProps): React.JSX.Element {
  const [instructors, setInstructors] = React.useState<EduquestUser[]>([]);
  const [loadingInstructors, setLoadingInstructors] = React.useState(true);
  const [name, setName] = React.useState(courseGroup.name);
  const [sessionDay, setSessionDay] = React.useState(courseGroup.session_day);
  const [sessionTime, setSessionTime] = React.useState(courseGroup.session_time);
  const [instructorId, setInstructorId] = React.useState<number>(courseGroup.instructor.id);
  const [submitStatus, setSubmitStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const fetchInstructors = async (): Promise<void> => {
      try {
        const response = await getAdminEduquestUsers();
        setInstructors(response);
      } catch (error: unknown) {
        logger.error('Failed to fetch instructors', error);
      } finally {
        setLoadingInstructors(false);
      }
    };

    void fetchInstructors();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) {
      nextErrors.name = 'Group Name is required.';
    }
    if (!sessionDay) {
      nextErrors.sessionDay = 'Group Session Day is required.';
    }
    if (!sessionTime.trim()) {
      nextErrors.sessionTime = 'Group Session Time is required.';
    }
    if (!instructorId) {
      nextErrors.instructor = 'Instructor is required.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setSubmitStatus({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }
    setFormErrors({});

    const payload: CourseGroupUpdateForm = {
      name: name.trim(),
      session_day: sessionDay,
      session_time: sessionTime.trim(),
      instructor_id: instructorId,
    };

    try {
      await updateCourseGroup(courseGroup.id.toString(), payload);
      setSubmitStatus({ type: 'success', message: 'Course group updated successfully.' });
      await onSuccess();
      onCancel();
    } catch (error: unknown) {
      logger.error('Failed to update course group', error);
      setSubmitStatus({ type: 'error', message: 'Failed to update course group.' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ marginBottom: 2 }}>
        <CardHeader
          title="Edit Group"
          subheader={`Update details for Group ID: ${courseGroup.id.toString()}`}
          action={
            <Button startIcon={<XCircleIcon />} variant="text" color="error" onClick={onCancel}>
              Cancel
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.name)}>
                <FormLabel htmlFor="group-name-edit">Group Name</FormLabel>
                <TextField
                  id="group-name-edit"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (formErrors.name) {
                      setFormErrors((prevState) => ({ ...prevState, name: '' }));
                    }
                  }}
                  variant="outlined"
                  size="small"
                  required
                  error={Boolean(formErrors.name)}
                  helperText={formErrors.name || ''}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.sessionDay)}>
                <FormLabel htmlFor="group-session-day-edit">Group Session Day</FormLabel>
                <Select
                  id="group-session-day-edit"
                  value={sessionDay}
                  onChange={(event) => {
                    setSessionDay(String(event.target.value));
                    if (formErrors.sessionDay) {
                      setFormErrors((prevState) => ({ ...prevState, sessionDay: '' }));
                    }
                  }}
                  size="small"
                  required
                >
                  <MenuItem value="Monday">Monday</MenuItem>
                  <MenuItem value="Tuesday">Tuesday</MenuItem>
                  <MenuItem value="Wednesday">Wednesday</MenuItem>
                  <MenuItem value="Thursday">Thursday</MenuItem>
                  <MenuItem value="Friday">Friday</MenuItem>
                  <MenuItem value="Saturday">Saturday</MenuItem>
                  <MenuItem value="Sunday">Sunday</MenuItem>
                </Select>
                {formErrors.sessionDay ? <FormHelperText>{formErrors.sessionDay}</FormHelperText> : null}
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.sessionTime)}>
                <FormLabel htmlFor="group-session-time-edit">Group Session Time</FormLabel>
                <TextField
                  id="group-session-time-edit"
                  value={sessionTime}
                  onChange={(event) => {
                    setSessionTime(event.target.value);
                    if (formErrors.sessionTime) {
                      setFormErrors((prevState) => ({ ...prevState, sessionTime: '' }));
                    }
                  }}
                  variant="outlined"
                  size="small"
                  required
                  error={Boolean(formErrors.sessionTime)}
                  helperText={formErrors.sessionTime || ''}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.instructor)}>
                <FormLabel htmlFor="instructor-edit">Instructor</FormLabel>
                <Select
                  id="instructor-edit"
                  value={instructorId}
                  onChange={(event) => {
                    setInstructorId(Number(event.target.value));
                    if (formErrors.instructor) {
                      setFormErrors((prevState) => ({ ...prevState, instructor: '' }));
                    }
                  }}
                  size="small"
                  required
                  disabled={loadingInstructors}
                >
                  {instructors.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                    {option.id} - {option.nickname}
                  </MenuItem>
                ))}
                </Select>
                {formErrors.instructor ? <FormHelperText>{formErrors.instructor}</FormHelperText> : null}
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Button startIcon={<TrashIcon />} variant="text" color="error" onClick={() => { void onDelete(); }}>
            Delete Group
          </Button>
          <Button startIcon={<FloppyDiskIcon />} type="submit" variant="contained">
            Update Group
          </Button>
        </CardActions>
      </Card>
      {submitStatus ? <Alert severity={submitStatus.type}>{submitStatus.message}</Alert> : null}
    </form>
  );
}
