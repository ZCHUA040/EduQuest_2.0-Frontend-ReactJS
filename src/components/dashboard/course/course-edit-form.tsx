"use client";

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Unstable_Grid2';
import type { Course } from "@/types/course";
import type {Term} from "@/types/term";
import {logger} from "@/lib/default-logger";
import Typography from "@mui/material/Typography";
import Select, { type SelectChangeEvent} from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type {Image} from "@/types/image";
import {CardMedia, TextField} from "@mui/material";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import {XCircle as XCircleIcon} from "@phosphor-icons/react/dist/ssr/XCircle";
import {Trash as TrashIcon} from "@phosphor-icons/react/dist/ssr/Trash";
import {FloppyDisk as FloppyDiskIcon} from "@phosphor-icons/react/dist/ssr/FloppyDisk";
import {useUser} from "@/hooks/use-user";
import {paths} from "@/paths";
import {useRouter} from "next/navigation";
import Stack from "@mui/material/Stack";
import FormLabel from "@mui/material/FormLabel";
import {useTheme} from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import {Info as InfoIcon} from "@phosphor-icons/react/dist/ssr/Info";
import {getNonPrivateTerms} from "@/api/services/term";
import {getAdminEduquestUsers} from "@/api/services/eduquest-user";
import {getImages} from "@/api/services/image";
import type {EduquestUser} from "@/types/eduquest-user";
import {deleteCourse, updateCourse} from "@/api/services/course";
import OutlinedInput from "@mui/material/OutlinedInput";
import Box from "@mui/material/Box";
import {User as UserIcon} from "@phosphor-icons/react/dist/ssr/User";


interface CourseFormProps {
  setSubmitStatus: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; message: string } | null>>;
  course: Course;
  toggleForm: () => void;
  onUpdateSuccess: () => void;
}

export function CourseEditForm({ setSubmitStatus, course, toggleForm, onUpdateSuccess }: CourseFormProps): React.JSX.Element {
  const router = useRouter();
  const { eduquestUser } = useUser();
  const theme = useTheme();

  const courseCodeRef = React.useRef<HTMLInputElement>(null);
  const courseNameRef = React.useRef<HTMLInputElement>(null);
  const courseDescriptionRef = React.useRef<HTMLInputElement>(null);
  const courseStatusRef = React.useRef<HTMLInputElement>(null);
  const courseTypeRef = React.useRef<HTMLInputElement>(null);
  const courseTermIdRef = React.useRef<HTMLInputElement>(null);
  const courseImageIdRef = React.useRef<HTMLInputElement>(null);

  const [images, setImages] = React.useState<Image[]>();
  const [terms, setTerms] = React.useState<Term[]>();
  const [coordinators, setCoordinators] = React.useState<EduquestUser[]>();

  const [selectedTerm, setSelectedTerm] = React.useState<Term | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<Image | null>(null);
  const [selectedCoordinators, setSelectedCoordinators] = React.useState<EduquestUser[]>([]);

  const [isCoordinatorsLoading, setIsCoordinatorsLoading] = React.useState<boolean>(true);
  const [isTermsLoading, setIsTermsLoading] = React.useState<boolean>(true);
  const [isImagesLoading, setIsImagesLoading] = React.useState<boolean>(true);

  const fetchTerms = async (): Promise<void> => {
    try {
      const response = await getNonPrivateTerms();
      setTerms(response);
    }
    catch (error: unknown) {
      logger.error('Failed to fetch terms', error);
    }
    finally {
      setIsTermsLoading(false);
    }
  }

  const fetchCoordinators = async (): Promise<void> => {
    try {
      const response = await getAdminEduquestUsers();
      setCoordinators(response);
    } catch (error: unknown) {
      logger.error('Failed to fetch coordinators', error);
    } finally {
      setIsCoordinatorsLoading(false);
    }
  }

  const fetchImages = async (): Promise<void> => {
    try {
      const response = await getImages();
      setImages(response);
    } catch (error: unknown) {
      logger.error('Failed to fetch images', error);
    } finally {
      setIsImagesLoading(false);
    }
  }

  // Handle Term Change
  const handleTermChange = (event: SelectChangeEvent<number>): void => {
    const termId = Number(event.target.value);
    const term = terms?.find(t => t.id === termId) || null;
    setSelectedTerm(term);
  };

  // Handle Image Change
  const handleImageChange = (event: SelectChangeEvent<number>): void => {
    const imageId = Number(event.target.value);
    const image = images?.find(i => i.id === imageId) || null;
    setSelectedImage(image);
  };

  // Handle Coordinators Change
  const handleCoordinatorsChange = (event: SelectChangeEvent<number[]>): void => {
    const {
      target: { value },
    } = event;

    // Map the selected values back to the corresponding coordinators
    const selectedCoordinatorIds = typeof value === 'string' ? value.split(',').map(Number) : value;
    const selectedCoordinatorObjects = coordinators?.filter(coordinator => selectedCoordinatorIds.includes(coordinator.id)) || [];

    setSelectedCoordinators(selectedCoordinatorObjects);
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (selectedCoordinators.length > 0) {
      const updatedCourse = {
        code: courseCodeRef.current?.value.trim(),
        name: courseNameRef.current?.value.trim(),
        type: courseTypeRef.current?.value.trim(),
        description: courseDescriptionRef.current?.value.trim(),
        status: courseStatusRef.current?.value.trim(),
        term_id: selectedTerm?.id, // Ensure this is a number
        image_id: selectedImage?.id, // Ensure this is a number
        coordinators: selectedCoordinators.map((coordinator) => coordinator.id)
      };
      try {
        await updateCourse(course.id.toString(), updatedCourse);
        setSubmitStatus({ type: 'success', message: 'Update Successful' });
        toggleForm();
        onUpdateSuccess();
      } catch (error: unknown) {
        logger.error('Failed to update the course', error);
        setSubmitStatus({ type: 'error', message: 'Update Failed. Please try again.' });
      }
    } else {
      logger.error('At least one coordinator is required');
      setSubmitStatus({ type: 'error', message: 'At least one coordinator is required' });
    }

  };

  const handleDeleteCourse = async (): Promise<void> => {
    try {
      await deleteCourse(course.id);

      router.push(paths.dashboard.course.all);
    } catch (error) {
      logger.error('Failed to delete the course', error);
      setSubmitStatus({ type: 'error', message: 'Delete Failed. Please try again.' });
    }
  };

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchTerms();
      await fetchCoordinators();
      await fetchImages();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, []);

  // sets selectedCoordinators based on course.coordinators_summary
  // once the coordinators data is fetched
  React.useEffect(() => {
    if (coordinators && course.coordinators_summary) {
      const initialSelected = coordinators.filter(c =>
        course.coordinators_summary.some(cs => cs.id === c.id)
      );
      setSelectedCoordinators(initialSelected);
    }
  }, [coordinators, course.coordinators_summary]);


  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title="Edit Course Details"
          subheader={`ID: ${course.id.toString()}`}
          action={
            eduquestUser?.is_staff ?
              <Stack direction="row" spacing={1} sx={{alignItems: 'center'}} color="error">
                <Button startIcon={<XCircleIcon fontSize="var(--icon-fontSize-md)" />} onClick={toggleForm} color="error">
                  Cancel
                </Button>
              </Stack> : null
          }
        />
        <Divider/>

        <CardContent>

          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="course code">Course Code</FormLabel>
                <TextField
                  defaultValue={course.code}
                  placeholder="The code of the course"
                  variant='outlined'
                  size='small'
                  inputRef={courseCodeRef}
                  required
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="course name">Course Name</FormLabel>
                <TextField
                  defaultValue={course.name}
                  placeholder="The name of the course"
                  variant='outlined'
                  size='small'
                  inputRef={courseNameRef}
                  required
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                  <FormLabel htmlFor="course type">Course Type</FormLabel>
                  <Tooltip title={
                    <Typography variant="inherit">
                      <strong>System-enroll:</strong> User are not allowed to self-enroll.<br />
                      <strong>Self-enroll:</strong> User are free to self-enroll.<br />
                      <strong>Private:</strong> Used for personal quest generation.
                    </Typography>
                  } placement="top">
                    <InfoIcon fontSize="var(--icon-fontSize-sm)" style={{ marginBottom: '8px', cursor: 'pointer', color: 'var(--mui-palette-neutral-500)' }} />
                  </Tooltip>
                </Stack>
                <Select defaultValue={course.type} label="Type" inputRef={courseTypeRef} name="type" size="small" required>
                  <MenuItem value="System-enroll"><Chip variant="outlined" label="System-enroll" color="primary" size="small"/></MenuItem>
                  <MenuItem value="Self-enroll"><Chip variant="outlined" label="Self-enroll" color="success" size="small"/></MenuItem>
                  <MenuItem value="Private"><Chip variant="outlined" label="Private" color="secondary" size="small"/></MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="course status">Course Status</FormLabel>
                <Select defaultValue={course.status} label="Status" inputRef={courseStatusRef} name="status" size="small" required>
                  <MenuItem value="Active"><Chip variant="outlined" label="Active" color="success" size="small"/></MenuItem>
                  <MenuItem value="Expired"><Chip variant="outlined" label="Expired" color="secondary" size="small"/></MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="course description">Course Description</FormLabel>
                <TextField
                  inputRef={courseDescriptionRef}
                  defaultValue={course.description}
                  placeholder="The description of the course"
                  variant='outlined'
                  multiline
                  size="medium"
                  rows={3}
                  required
                />
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="course-coordinators">Course Coordinators</FormLabel>
                <Select
                  labelId="coordinators-label"
                  id="course-coordinators"
                  size='small'
                  multiple
                  value={selectedCoordinators.map((coordinator) => coordinator.id)}                  onChange={handleCoordinatorsChange}
                  input={<OutlinedInput label="Course Coordinators" />} // Corrected input component
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const coordinator = coordinators?.find(c => c.id === value);
                        return (
                          <Chip
                            icon={<UserIcon size={14} />} // Ensure UserIcon is imported
                            key={value}
                            label={coordinator ? coordinator.nickname : value}
                          />
                        );
                      })}
                    </Box>
                  )}
                  required
                >
                  {isCoordinatorsLoading ? (
                    <MenuItem disabled>
                      <Skeleton variant="text" width="100%" />
                    </MenuItem>
                  ) : coordinators && coordinators.length > 0 ? (
                    coordinators.map((coordinator) => (
                      <MenuItem key={coordinator.id} value={coordinator.id}>
                        {coordinator.id} ({coordinator.nickname})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No Coordinators Available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>



          </Grid>

          <Divider sx={{my: 4}}/>

          <Typography sx={{my: 3}} variant="h6">Term</Typography>
          {isTermsLoading ? <Skeleton variant="rectangular" height={100}  />
            : terms ?
            <Grid container spacing={3}>

            <Grid md={6} xs={12}>
              <FormControl required>
                <FormLabel htmlFor="term id">Term ID</FormLabel>
                <Select defaultValue={course.term.id} onChange={handleTermChange} inputRef={courseTermIdRef}
                        label="Term ID" variant="outlined" type="number" size="small" required>
                  {terms.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.id} - AY{option.academic_year.start_year}-{option.academic_year.end_year} {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid md={6} xs={12} sx={{ display: { xs: 'none', md: 'block' } }}/>
            <Grid md={3} xs={6}>
              <Typography variant="overline" color="text.secondary">Term Name</Typography>
              <Typography variant="body2">{selectedTerm?.name || course.term.name}</Typography>
            </Grid>
            <Grid md={3} xs={6}>
              <Typography variant="overline" color="text.secondary">Term Start Date</Typography>
              <Typography variant="body2">{selectedTerm?.start_date || course.term.start_date}</Typography>

            </Grid>
            <Grid md={3} xs={6}>
              <Typography variant="overline" color="text.secondary">Term End Date</Typography>
              <Typography variant="body2">{selectedTerm?.end_date || course.term.end_date}</Typography>

            </Grid>
            <Grid md={3} xs={6}>
              <Typography variant="overline" color="text.secondary">Academic Year ID</Typography>
              <Typography variant="body2">{selectedTerm?.academic_year.id || course.term.academic_year.id}</Typography>
            </Grid>
            <Grid md={3} xs={6}>
              <Typography variant="overline" color="text.secondary">Academic Year</Typography>
              <Typography variant="body2">AY {selectedTerm?.academic_year.start_year || course.term.academic_year.start_year}-{selectedTerm?.academic_year.end_year || terms[0].academic_year.end_year}</Typography>
            </Grid>
          </Grid> : null}

          <Divider sx={{my: 4}}/>

          <Typography sx={{my: 3}} variant="h6">Thumbnail</Typography>

          {isImagesLoading ? <Skeleton variant="rectangular" height={100}  />
            : images ?
            <Grid container spacing={3} >
              <Grid container md={6} xs={12} alignItems="flex-start">
                <Grid xs={12}>

                  <FormControl required>
                    <FormLabel htmlFor="image id">Thumbnail ID</FormLabel>
                    <Select defaultValue={course.image.id} onChange={handleImageChange} inputRef={courseImageIdRef}
                            label="Thumbnail ID" variant="outlined" type="number" size="small" required>
                      {images.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.id} - {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Thumbnail Name</Typography>
                  <Typography variant="body2">{selectedImage?.name || course.image.name}</Typography>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Thumbnail Filename</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {selectedImage?.filename || course.image.filename}
                  </Typography>
                </Grid>
              </Grid>

              <Grid md={6} xs={12}>
                <Typography variant="overline" color="text.secondary">Thumbnail Preview</Typography>
                <CardMedia
                  component="img"
                  alt={selectedImage?.name || images[0].name}
                  image={`/assets/${selectedImage?.filename || course.image.filename}`}
                  sx={{ backgroundColor: theme.palette.background.level1, border: `1px solid ${theme.palette.neutral[200]}`, borderRadius: '8px' }}

                />
              </Grid>
            </Grid> : null}
        </CardContent>

        <CardActions sx={{justifyContent: 'space-between'}}>
          <Button startIcon={<TrashIcon/>} color="error" onClick={handleDeleteCourse}>Delete Course</Button>
          <Button startIcon={<FloppyDiskIcon/>} type="submit" variant="contained">Update Course</Button>
        </CardActions>
      </Card>

    </form>
  );
}
