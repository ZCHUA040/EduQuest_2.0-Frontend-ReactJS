"use client";

import * as React from 'react';
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
import {logger} from "@/lib/default-logger";
import Typography from "@mui/material/Typography";
import type {Term} from "@/types/term";
import Select, { type SelectChangeEvent} from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { FilePlus as FilePlusIcon } from '@phosphor-icons/react/dist/ssr/FilePlus';
import type {Image} from "@/types/image";
import {CardMedia, TextField} from "@mui/material";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import {useTheme} from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import {Info as InfoIcon} from "@phosphor-icons/react/dist/ssr/Info";
import {getNonPrivateTerms} from "@/api/services/term";
import {getImages} from "@/api/services/image";
import {createCourse} from "@/api/services/course";
import {getAdminEduquestUsers} from "@/api/services/eduquest-user";
import type {EduquestUser} from "@/types/eduquest-user";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import {User as UserIcon} from "@phosphor-icons/react/dist/ssr/User";

interface CourseFormProps {
  onFormSubmitSuccess: () => void;
}

export function CourseNewForm({ onFormSubmitSuccess }: CourseFormProps): React.JSX.Element {
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

  const [isCoordinatorsLoading, setIsCoordinatorsLoading] = React.useState<boolean>(true);
  const [isTermsLoading, setIsTermsLoading] = React.useState<boolean>(true);
  const [isImagesLoading, setIsImagesLoading] = React.useState<boolean>(true);

  const [selectedTerm, setSelectedTerm] = React.useState<Term | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<Image | null>(null);
  const [selectedCoordinators, setSelectedCoordinators] = React.useState<EduquestUser[]>([]);

  const [submitStatus, setSubmitStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

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
    if (formErrors.term) {
      setFormErrors(prev => ({ ...prev, term: '' }));
    }
  };

  // Handle Image Change
  const handleImageChange = (event: SelectChangeEvent<number>): void => {
    const imageId = Number(event.target.value);
    const image = images?.find(i => i.id === imageId) || null;
    setSelectedImage(image);
    if (formErrors.image) {
      setFormErrors(prev => ({ ...prev, image: '' }));
    }
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
    if (formErrors.coordinators) {
      setFormErrors(prev => ({ ...prev, coordinators: '' }));
    }
  };



  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!courseNameRef.current?.value.trim()) {
      nextErrors.courseName = 'Course Name is required.';
    }
    if (!courseCodeRef.current?.value.trim()) {
      nextErrors.courseCode = 'Course Code is required.';
    }
    if (!courseDescriptionRef.current?.value.trim()) {
      nextErrors.courseDescription = 'Course Description is required.';
    }
    if (!courseTypeRef.current?.value.trim()) {
      nextErrors.courseType = 'Course Type is required.';
    }
    if (!courseStatusRef.current?.value.trim()) {
      nextErrors.courseStatus = 'Course Status is required.';
    }
    if (selectedCoordinators.length === 0) {
      nextErrors.coordinators = 'Please select at least one coordinator.';
    }
    if (!selectedImage) {
      nextErrors.image = 'Please select a thumbnail.';
    }
    if (!selectedTerm) {
      nextErrors.term = 'Please select a term.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setSubmitStatus({
        type: 'error',
        message: `Please complete all the required fields.`
      });
      return;
    }

    setFormErrors({});

    if (
      courseCodeRef.current &&
      courseNameRef.current &&
      courseDescriptionRef.current &&
      courseStatusRef.current &&
      courseTypeRef.current &&
      selectedTerm &&
      selectedImage &&
      selectedCoordinators.length > 0
    ) {
      const newCourse = {
        code: courseCodeRef.current.value.trim(),
        name: courseNameRef.current.value.trim(),
        description: courseDescriptionRef.current.value.trim(),
        status: courseStatusRef.current.value.trim(),
        type: courseTypeRef.current.value.trim(),
        term_id: selectedTerm.id, // Ensure this is a number
        image_id: selectedImage.id, // Ensure this is a number
        coordinators: selectedCoordinators.map((coordinator) => coordinator.id)
      };
      try {
        const response = await createCourse(newCourse);
        onFormSubmitSuccess();
        logger.debug('New Course has been created successfully:', response);
        setSubmitStatus({ type: 'success', message: 'Create Successful' });
        setFormErrors({});

        if (courseCodeRef.current) {
          courseCodeRef.current.value = '';
        }
        if (courseNameRef.current) {
          courseNameRef.current.value = '';
        }
        if (courseDescriptionRef.current) {
          courseDescriptionRef.current.value = '';
        }

        setSelectedCoordinators([]);
        setSelectedTerm(terms?.[0] ?? null);
        setSelectedImage(images?.[0] ?? null);
      }
      catch (error: unknown) {
        logger.error('Failed to create new course', error);
        setSubmitStatus({ type: 'error', message: 'Create Failed. Please try again.' });
      }
    }
    else {
      logger.error('One or more form fields are missing.');
      setSubmitStatus({ type: 'error', message: 'All fields are required.' });
    }
  };

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchCoordinators();
      await fetchTerms();
      await fetchImages();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, []);

  // Pre-select the first term
  React.useEffect(() => {
    if (terms && terms.length > 0) {
      setSelectedTerm(terms[0]);
    }
  }, [terms]);

  // Pre-select the first image
  React.useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);


  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="Add new course to the system" title="New Course" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Course Name */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.courseName)}>
                <FormLabel htmlFor="course-name">Course Name</FormLabel>
                <TextField
                  id="course-name"
                  inputRef={courseNameRef}
                  placeholder="The title of the course"
                  variant='outlined'
                  size='small'
                  error={Boolean(formErrors.courseName)}
                  helperText={formErrors.courseName || ''}
                  onChange={() => {
                    if (formErrors.courseName) {
                      setFormErrors(prev => ({ ...prev, courseName: '' }));
                    }
                  }}
                  required
                />
              </FormControl>
            </Grid>

            {/* Course Code */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.courseCode)}>
                <FormLabel htmlFor="course-code">Course Code</FormLabel>
                <TextField
                  id="course-code"
                  inputRef={courseCodeRef}
                  placeholder="The code of the course"
                  variant='outlined'
                  size='small'
                  error={Boolean(formErrors.courseCode)}
                  helperText={formErrors.courseCode || ''}
                  onChange={() => {
                    if (formErrors.courseCode) {
                      setFormErrors(prev => ({ ...prev, courseCode: '' }));
                    }
                  }}
                  required
                />
              </FormControl>
            </Grid>

            {/* Course Type */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.courseType)}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FormLabel htmlFor="course-type">Course Type</FormLabel>
                  <Tooltip
                    title={
                      <Typography variant="inherit">
                        <strong>System-enroll:</strong> Users are not allowed to self-enroll.<br />
                        <strong>Self-enroll:</strong> Users are free to self-enroll.<br />
                        <strong>Private:</strong> Used for personal quest generation.
                      </Typography>
                    }
                    placement="top"
                  >

                    <InfoIcon
                      fontSize="var(--icon-fontSize-sm)"
                      style={{ marginBottom: '8px', cursor: 'pointer', color: 'var(--mui-palette-neutral-500)' }}
                    />
                  </Tooltip>
                </Stack>
                <Select
                  id="course-type"
                  defaultValue="System-enroll"
                  size='small'
                  label="Course Type"
                  inputRef={courseTypeRef}
                  name="type"
                  required
                >
                  <MenuItem value="System-enroll">
                    <Chip variant="outlined" label="System-enroll" color="primary" size="small" />
                  </MenuItem>
                  <MenuItem value="Self-enroll">
                    <Chip variant="outlined" label="Self-enroll" color="success" size="small" />
                  </MenuItem>
                  <MenuItem value="Private">
                    <Chip variant="outlined" label="Private" color="secondary" size="small" />
                  </MenuItem>
                </Select>
                {formErrors.courseType ? <FormHelperText>{formErrors.courseType}</FormHelperText> : null}
              </FormControl>
            </Grid>

            {/* Course Status */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.courseStatus)}>
                <FormLabel htmlFor="course-status">Course Status</FormLabel>
                <Select
                  id="course-status"
                  defaultValue="Active"
                  size='small'
                  label="Course Status"
                  inputRef={courseStatusRef}
                  name="status"
                  required
                >
                  <MenuItem value="Active">
                    <Chip variant="outlined" label="Active" color="success" size="small" />
                  </MenuItem>
                  <MenuItem value="Expired">
                    <Chip variant="outlined" label="Expired" color="secondary" size="small" />
                  </MenuItem>
                </Select>
                {formErrors.courseStatus ? <FormHelperText>{formErrors.courseStatus}</FormHelperText> : null}
              </FormControl>
            </Grid>

            {/* Course Description */}
            <Grid xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.courseDescription)}>
                <FormLabel htmlFor="course-description">Course Description</FormLabel>
                <TextField
                  id="course-description"
                  inputRef={courseDescriptionRef}
                  placeholder="The description of the course"
                  variant='outlined'
                  multiline
                  size="medium"
                  rows={3}
                  error={Boolean(formErrors.courseDescription)}
                  helperText={formErrors.courseDescription || ''}
                  onChange={() => {
                    if (formErrors.courseDescription) {
                      setFormErrors(prev => ({ ...prev, courseDescription: '' }));
                    }
                  }}
                  required
                />
              </FormControl>
            </Grid>

            {/* Coordinators Selection */}
            <Grid xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.coordinators)}>
                <FormLabel htmlFor="course-coordinators">Course Coordinators</FormLabel>
                <Select
                  labelId="coordinators-label"
                  id="course-coordinators"
                  size='small'
                  multiple
                  value={selectedCoordinators.map(coordinator => coordinator.id)} // Pass only the IDs for the value
                  onChange={handleCoordinatorsChange}
                  input={<OutlinedInput label="Course Coordinators" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const coordinator = coordinators?.find(c => c.id === value);
                        return <Chip icon={<UserIcon size={14}/>} key={value} label={coordinator ? coordinator.nickname : value} />;
                      })}
                    </Box>
                  )}
                  required
                >
                  {isCoordinatorsLoading ? (
                    <MenuItem disabled>
                      <Skeleton variant="text" width="100%"/>
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
                {formErrors.coordinators ? <FormHelperText>{formErrors.coordinators}</FormHelperText> : null}
              </FormControl>
            </Grid>

          </Grid>

          <Divider sx={{my:3}}/>

          <Stack direction="row" sx={{ my: 3, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Thumbnail</Typography>
          </Stack>

          {isImagesLoading ? <Skeleton variant="rectangular" height={50}/>
            : images && images.length > 0 ?
            <Grid container spacing={3} >
              <Grid container md={6} xs={12} alignItems="flex-start">
                <Grid xs={12}>
                  <FormControl required error={Boolean(formErrors.image)}>
                    <FormLabel htmlFor="thumbnail id">Thumbnail ID</FormLabel>
                <Select
                  value={selectedImage?.id ?? ''}
                  onChange={handleImageChange}
                  inputRef={courseImageIdRef}
                  label="Thumbnail ID"
                  variant="outlined"
                  type="number"
                  size="small"
                  required
                >
                      {images.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.id} - {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.image ? <FormHelperText>{formErrors.image}</FormHelperText> : null}
                  </FormControl>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Thumbnail Name</Typography>
                  <Typography variant="body2">{selectedImage?.name}</Typography>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Thumbnail Filename</Typography>
                  <Typography variant="body2">{selectedImage?.filename}</Typography>
                </Grid>
              </Grid>

              <Grid md={6} xs={12}>
                <Typography variant="overline" color="text.secondary">Thumbnail Preview</Typography>
                <CardMedia
                  component="img"
                  alt={selectedImage?.name}
                  image={`/assets/${selectedImage?.filename ?? ''}`}
                  sx={{ backgroundColor: theme.palette.background.level1, border: `1px solid ${theme.palette.neutral[200]}`, borderRadius: '8px' }}
                />
              </Grid>
            </Grid> : null}

          <Divider sx={{my:3}}/>

          <Stack direction="row" sx={{ my: 3, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Term</Typography>
          </Stack>
          {isTermsLoading ? <Skeleton variant="rectangular" height={50}/>
          : terms && terms.length > 0 ?
            <Grid container spacing={3} >
              <Grid md={6} xs={12}>
                <FormControl required error={Boolean(formErrors.term)}>
                  <FormLabel htmlFor="term id">Term ID</FormLabel>
                  <Select
                    value={selectedTerm?.id ?? ''}
                    onChange={handleTermChange}
                    inputRef={courseTermIdRef}
                    label="Term ID"
                    variant="outlined"
                    type="number"
                    size="small"
                    required
                  >
                    {terms.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.id} - AY{option.academic_year.start_year}-{option.academic_year.end_year} {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.term ? <FormHelperText>{formErrors.term}</FormHelperText> : null}
                </FormControl>
              </Grid>
              <Grid md={6} xs={12} sx={{ display: { xs: 'none', md: 'block' } }}/>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary">Term Name</Typography>
                <Typography variant="body2">{selectedTerm?.name}</Typography>
              </Grid>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary">Term Start Date</Typography>
                <Typography variant="body2">{selectedTerm?.start_date}</Typography>
              </Grid>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary">Term End Date</Typography>
                <Typography variant="body2">{selectedTerm?.end_date}</Typography>
              </Grid>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary">Academic Year ID</Typography>
                <Typography variant="body2">{selectedTerm?.academic_year.id}</Typography>
              </Grid>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary">Start Year</Typography>
                <Typography variant="body2">{selectedTerm?.academic_year.start_year}</Typography>
              </Grid>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary">End Year</Typography>
                <Typography variant="body2">{selectedTerm?.academic_year.end_year}</Typography>
              </Grid>
            </Grid> : null}

        </CardContent>

        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            startIcon={<FilePlusIcon fontSize="var(--icon-fontSize-md)" />}
            type="submit"
            variant="contained"
          >
            Add
          </Button>
        </CardActions>
      </Card>

      {/* Submission Status */}
      {submitStatus ? (
        <Alert severity={submitStatus.type} sx={{ marginTop: 2 }}>
          {submitStatus.message}
        </Alert>
      ) : null}

    </form>
  );
}
